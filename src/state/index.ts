import type { Note } from "@tonejs/midi/dist/Note";
import { Midi } from "@tonejs/midi";
import * as d3 from "d3";
import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { clamp, range, startCase } from "lodash";
import sample from "@/assets/sample.mid?url";
import { random } from "@/util/math";

/** parsed midi file data */
export const midi = atom<Midi | null>(null);

/** filename of uploaded file */
export const filename = atom("");

/** load midi data */
export const loadMidi = (data: ArrayBuffer, fileName: string) => {
  /** parse midi */
  const newMidi = new Midi(data);
  console.debug(newMidi);

  /** name fallback */
  if (!newMidi.name) newMidi.name = startCase(fileName.replace(/\.midi?$/, ""));

  /** set state */
  store.set(midi, newMidi);
  store.set(filename, fileName);

  /** init tracks state */
  store.set(
    tracks,
    newMidi.tracks.map(() => window.structuredClone(defaults)),
  );
};

/** load sample file */
window.fetch(sample).then(async (response) => {
  loadMidi(await response.arrayBuffer(), "sample.mid");
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

/** parameters for each track */
export const tracks = atomWithStorage<Track[]>("tracks", []);

/** selected track index */
export const trackIndex = atom(0);

/** (derived) selected track */
export const track = atom((get) => get(tracks)[get(trackIndex)] ?? defaults);

/** whether editing a control updates all tracks */
export const editAll = atom(false);

/** (derived) index to use for track editing */
export const editIndex = atom((get) => (get(editAll) ? -1 : get(trackIndex)));

/** set track(s) value */
export const setTrack = (mutate: (track: Track) => void | Track) =>
  store.set(tracks, (tracks) => {
    /** which tracks to set value on */
    const indices = store.get(editAll)
      ? range(tracks.length)
      : [store.get(editIndex)];
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

/** reset parameters of track at index to defaults */
export const reset = () => setTrack(() => defaults);

/** (derived) lowest/highest pitch of current track */
export const pitchRange = atom((get) => {
  const currentTrack = get(midi)?.tracks[get(trackIndex)];
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
export const beatRange = atom((get) => {
  const currentTrack = get(midi)?.tracks[get(trackIndex)];
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
export const pitchGuides = atom((get) =>
  range(128).map((pitch) => ({
    top: pitch,
    width: get(midi)?.durationTicks || 96 * 16,
    black: !![1, 3, 6, 8, 10].includes(pitch % 12),
  })),
);

/** (derived) vertical beat guides */
export const beatGuides = atom((get) => {
  const beatGuides = [];

  /** get midi data */
  const ppq = get(midi)?.header.ppq || 96;
  const durationTicks = get(midi)?.durationTicks || ppq * 16;

  /** beat sub divisions */
  const subs = range(0, ppq, ppq / get(track).options.grid);

  /** create beats */
  for (let tick = 0; tick < durationTicks; tick += ppq) {
    for (const sub of subs) {
      const measure =
        get(midi)?.header.ticksToMeasures(tick + sub) ||
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

/** drift curve for given track parameters */
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
    values.push(random(["drift", tick, drift.seed], distribution));
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
export const driftCurve = atom((get) =>
  makeDriftCurve(
    get(midi)?.durationTicks || 0,
    get(track).drift,
    get(track).options.distribution,
  ),
);

/** (derived) humanized midi data*/
export const humanized = atom((get) => {
  /** deep clone to avoid altering original midi */
  const humanizedMidi = get(midi)?.clone();
  if (!humanizedMidi) return;

  /** go through each track */
  for (const [trackIndex, track] of humanizedMidi.tracks.entries()) {
    /** get track params */
    const { start, drift, duration, velocity, options } =
      get(tracks)[trackIndex] ?? defaults;

    /** make drift curve for track */
    const curve = makeDriftCurve(
      get(midi)?.durationTicks || 0,
      drift,
      options.distribution,
    );

    /** randomize start time */
    for (const note of track.notes) {
      note.ticks =
        note.ticks +
        /** spread */
        random(["start", note.ticks, start.seed], options.distribution) *
          start.randomness +
        /** drift */
        (curve[note.ticks] || 0) * drift.amount +
        /** transform */
        start.shift;
      /** to int */
      note.ticks = Math.round(note.ticks);
      /** limit */
      note.ticks = clamp(note.ticks, 0, get(midi)?.durationTicks || 0);
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
          (nextNote?.ticks || get(midi)?.durationTicks || 0) -
          /** where this note starts */
          note.ticks;
      }

    /** randomize duration */
    for (const note of track.notes)
      note.durationTicks = Math.round(
        (note.durationTicks +
          /** spread */
          random(
            ["duration", note.ticks, duration.seed],
            options.distribution,
          ) *
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
      const nextTicks = nextNote?.ticks || get(midi)?.durationTicks || 0;
      /** limit overlap */
      if (note.ticks + note.durationTicks + options.gap >= nextTicks)
        note.durationTicks = nextTicks - note.ticks - options.gap;
      /** limit */
      note.durationTicks = clamp(
        note.durationTicks,
        0,
        (get(midi)?.durationTicks || 0) - note.ticks,
      );
    }

    /** randomize velocity */
    for (const note of track.notes) {
      note.velocity =
        /** spread */
        (note.velocity +
          random(
            ["velocity", note.ticks, velocity.seed],
            options.distribution,
          ) *
            velocity.randomness +
          /** transform */
          velocity.shift) *
        velocity.scale;
      /** limit */
      note.velocity = clamp(note.velocity, 0, 1);
    }
  }

  /** for debugging */
  // @ts-expect-error extend window type
  window.humanized = humanizedMidi;

  return humanizedMidi;
});

/** singleton store instance to access state outside of react */
const store = getDefaultStore();
