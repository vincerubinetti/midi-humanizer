import type { Note } from "@tonejs/midi/dist/Note";
import { Midi } from "@tonejs/midi";
import * as d3 from "d3";
import { atom, getDefaultStore } from "jotai";
import { clamp, range, startCase } from "lodash";
import sample from "@/assets/sample.mid?url";
import { saveFile } from "@/util/file";
import { random } from "@/util/math";

/** mime type for regular download */
export const mimeType = "audio/midi";
/** types for file system access api pickers */
export const pickerTypes: FilePickerAcceptType[] = [
  { description: "MIDI file", accept: { "audio/midi": [".mid", ".midi"] } },
];

/** parsed midi file data */
export const midiAtom = atom<Midi | null>(null);

/** uploaded file */
export const fileAtom = atom<File | null>(null);

/** uploaded file handle */
export const handleAtom = atom<FileSystemFileHandle | null>(null);

/** load file */
export const load = async (
  file: File,
  handle: FileSystemFileHandle | null = null,
) => {
  /** parse midi */
  const data = await file.arrayBuffer();
  const midi = new Midi(data);

  console.info({ midi, file, handle });

  /** name fallback */
  if (!midi.name) midi.name = startCase(file.name.replace(/\.midi?$/, ""));

  /** set state */
  store.set(midiAtom, midi);
  store.set(fileAtom, file);
  store.set(handleAtom, handle);

  /** init tracks state */
  store.set(
    tracksAtom,
    midi.tracks.map(() => window.structuredClone(defaults)),
  );
};

/** save file */
export const save = async () => {
  /** data to save */
  const humanized = store.get(humanizedAtom);
  if (!humanized) return false;

  /** save new file */
  const picked = await saveFile(
    humanized.toArray() as BlobPart,
    store.get(handleAtom) || undefined,
    store.get(fileAtom)?.name || "output.mid",
    pickerTypes,
    mimeType,
  );

  /** user canceled */
  if (!picked) return null;

  const { file, handle } = picked;

  console.info({ file, handle });

  /** update state */
  if (file) store.set(fileAtom, file);
  if (handle) store.set(handleAtom, handle);

  /** success state */
  return !!file;
};

/** load sample file */
window.fetch(sample).then(async (response) => {
  load(new File([await response.arrayBuffer()], "sample.mid"));
});

/** defaults for reset-able fields */
export const defaults = {
  start: { randomness: 0, seed: 0, shift: 0 },
  drift: { amount: 0, seed: 0, step: 2 ** 9 },
  duration: { randomness: 0, seed: 0, shift: 0, scale: 1 },
  velocity: { randomness: 0, seed: 0, shift: 0, scale: 1 },
  options: {
    grid: 4,
    gap: 0,
    legato: false,
    polyphonic: true,
    distribution: "uniform",
  },
};

export type Track = typeof defaults;

/** params for each track */
export const tracksAtom = atom<Track[]>([]);

/** selected track index */
export const trackIndexAtom = atom(0);

/** (derived) selected track */
export const trackAtom = atom(
  (get) => get(tracksAtom)[get(trackIndexAtom)] ?? defaults,
);

/** whether editing a control updates all tracks */
export const editAllAtom = atom(false);

/** (derived) index to use for track editing */
export const editIndexAtom = atom((get) =>
  get(editAllAtom) ? -1 : get(trackIndexAtom),
);

/** set track(s) value */
export const setTrack = (mutate: (track: Track) => void | Track) =>
  store.set(tracksAtom, (tracks) => {
    /** which tracks to set value on */
    const indices = store.get(editAllAtom)
      ? range(tracks.length)
      : [store.get(editIndexAtom)];
    /** clone for mutating */
    tracks = window.structuredClone(tracks);
    /** run mutation function */
    for (const index of indices)
      if (tracks[index]) {
        const newTrack = mutate(tracks[index]);
        if (newTrack !== undefined) tracks[index] = newTrack;
      }
    return tracks;
  });

/** reset params of track at index to defaults */
export const reset = () => setTrack(() => defaults);

/** (derived) lowest/highest pitch of current track */
export const pitchRangeAtom = atom((get) => {
  const currentTrack = get(midiAtom)?.tracks[get(trackIndexAtom)];
  if (!currentTrack) return { min: 0, max: 127 };
  let min = 127;
  let max = 0;
  for (const note of currentTrack?.notes || []) {
    if (note.midi < min) min = note.midi;
    if (note.midi > max) max = note.midi;
  }
  return { min, max };
});

/** (derived) earliest/latest note of current track */
export const beatRangeAtom = atom((get) => {
  const currentTrack = get(midiAtom)?.tracks[get(trackIndexAtom)];
  if (!currentTrack) return { min: 0, max: 96 * 16 };
  let min = Infinity;
  let max = -Infinity;
  for (const note of currentTrack.notes) {
    if (note.ticks < min) min = note.ticks;
    if (note.ticks + note.durationTicks > max)
      max = note.ticks + note.durationTicks;
  }
  return { min, max };
});

/** (derived) horizontal pitch guides */
export const pitchGuidesAtom = atom((get) =>
  range(128).map((pitch) => ({
    top: pitch,
    width: get(midiAtom)?.durationTicks || 96 * 16,
    black: !![1, 3, 6, 8, 10].includes(pitch % 12),
  })),
);

/** (derived) vertical beat guides */
export const beatGuidesAtom = atom((get) => {
  const beatGuides = [];

  /** get midi data */
  const ppq = get(midiAtom)?.header.ppq || 96;
  const durationTicks = get(midiAtom)?.durationTicks || ppq * 16;

  /** beat sub divisions */
  const subs = range(0, ppq, ppq / get(trackAtom).options.grid);

  /** create beats */
  for (let tick = 0; tick < durationTicks; tick += ppq) {
    for (const sub of subs) {
      const measure =
        get(midiAtom)?.header.ticksToMeasures(tick + sub) ||
        (tick + sub) / (ppq * 4);

      beatGuides.push({
        left: tick + sub,
        height: 127,
        type: measure % 1 === 0 ? "major" : sub === 0 ? "minor" : "sub",
      });
    }
  }

  return beatGuides;
});

/** drift curve for given track params */
const makeDriftCurve = (
  durationTicks: number,
  drift: Track["drift"],
  distribution: string,
) => {
  /** list of ticks */
  const ticks = [];
  /** list of corresponding drift values */
  const values = [];

  /** generate random point every certain amount of ticks */
  const step = clamp(drift.step, 1, durationTicks);
  for (let tick = 0; tick <= durationTicks; tick += step) {
    ticks.push(tick);
    values.push(random(["drift", tick / step, drift.seed], distribution));
  }

  /** create step wise interpolator between sparse points */
  const scale = d3
    .scaleLinear()
    .domain(ticks)
    .range(values)
    /** interpolate between points with sine wave */
    .interpolate((a, b) => (t) => {
      const y = 0.5 - Math.cos(Math.PI * t) / 2;
      return a + (b - a) * y;
    });

  /** interpolate for each tick */
  return range(durationTicks).map((_, index) => scale(index));
};

/** (derived) drift curve of selected track */
export const driftCurveAtom = atom((get) =>
  makeDriftCurve(
    get(midiAtom)?.durationTicks || 0,
    get(trackAtom).drift,
    get(trackAtom).options.distribution,
  ),
);

/** (derived) humanized midi data*/
export const humanizedAtom = atom((get) => {
  /** deep clone to avoid altering original midi */
  const humanizedMidi = get(midiAtom)?.clone();
  if (!humanizedMidi) return;

  /** go through each track */
  for (const [trackIndex, track] of humanizedMidi.tracks.entries()) {
    /** get track params */
    const { start, drift, duration, velocity, options } =
      get(tracksAtom)[trackIndex] ?? defaults;

    /** make drift curve for track */
    const driftCurve = drift.amount
      ? makeDriftCurve(
          get(midiAtom)?.durationTicks || 0,
          drift,
          options.distribution,
        )
      : [];

    /** randomize start time */
    for (const [index, note] of track.notes.entries()) {
      note.ticks =
        note.ticks +
        /** spread */
        random(["start", index, start.seed], options.distribution) *
          start.randomness +
        /** drift */
        (driftCurve[note.ticks] || 0) * drift.amount +
        /** transform */
        start.shift;
      /** to int */
      note.ticks = Math.round(note.ticks);
      /** limit */
      note.ticks = clamp(note.ticks, 0, get(midiAtom)?.durationTicks || 0);
    }

    /** make sure notes still in chronological order */
    track.notes.sort((a, b) => a.ticks - b.ticks);

    /** make map of each note to next note */
    const nextNotes = new Map<Note, Note>();
    for (const [noteIndex, note] of Object.entries(track.notes)) {
      /** find next note */
      const nextNote = track.notes.slice(Number(noteIndex) + 1).find(
        (other) =>
          /** make sure not simultaneous */
          other.ticks > note.ticks &&
          /** check pitches */
          (other.midi === note.midi || !options.polyphonic),
      );
      if (nextNote) nextNotes.set(note, nextNote);
    }

    /** legato-ize */
    if (options.legato)
      for (const note of track.notes) {
        /** lookup next note... */
        const nextNote = nextNotes.get(note);
        /** extend this note to next */
        note.durationTicks =
          /** where next note starts */
          (nextNote?.ticks || get(midiAtom)?.durationTicks || 0) -
          /** where this note starts */
          note.ticks;
      }

    /** randomize duration */
    for (const [index, note] of track.notes.entries())
      note.durationTicks = Math.round(
        (note.durationTicks +
          /** spread */
          random(["duration", index, duration.seed], options.distribution) *
            duration.randomness +
          /** transform */
          duration.shift) *
          duration.scale,
      );

    /** enforce gaps */
    for (const note of track.notes) {
      /** lookup next note... */
      const nextNote = nextNotes.get(note);
      /** where next note starts */
      const nextTicks = nextNote?.ticks || get(midiAtom)?.durationTicks || 0;
      /** limit overlap */
      if (note.ticks + note.durationTicks + options.gap >= nextTicks)
        note.durationTicks = nextTicks - note.ticks - options.gap;
      /** limit */
      note.durationTicks = clamp(
        note.durationTicks,
        0,
        (get(midiAtom)?.durationTicks || 0) - note.ticks,
      );
    }

    /** randomize velocity */
    for (const [index, note] of track.notes.entries()) {
      note.velocity =
        /** spread */
        (note.velocity +
          random(["velocity", index, velocity.seed], options.distribution) *
            (velocity.randomness / 127) +
          /** transform */
          velocity.shift / 127) *
        velocity.scale;
      /** limit */
      note.velocity = clamp(note.velocity, 1 / 127, 1);
    }
  }

  /** for debugging */
  // @ts-expect-error extend window type
  window.humanized = humanizedMidi;

  return humanizedMidi;
});

/** singleton store instance to access state outside of react */
const store = getDefaultStore();
