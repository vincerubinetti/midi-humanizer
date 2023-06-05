import * as d3 from "d3";
import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { clamp, range } from "lodash";
import { Midi } from "@tonejs/midi";
import { Note } from "@tonejs/midi/dist/Note";
import { noteHeight } from "@/sections/PianoRoll";
import { random } from "@/util/math";

/** defaults for reset-able fields */
export const defaults = {
  start: { randomness: 0, seed: 0, shift: 0 },
  drift: { amount: 0, seed: 0, step: 2 ** 9 },
  duration: { randomness: 0, seed: 0, shift: 0, scale: 1 },
  velocity: { randomness: 0, seed: 0, shift: 0, scale: 1 },
  options: { grid: 4, gap: 0, legato: false, poly: true, incSeed: false },
};

/** file */
export const midi = atom<Midi | null>(null);
export const track = atom(0);
export const filename = atom("");
export const pitchRange = atom((get) => {
  /** get current track */
  const currentTrack = get(midi)?.tracks[get(track)];

  /** find min/max pitches */
  let min;
  let max;
  for (const note of currentTrack?.notes || []) {
    if (!min || note.midi < min) min = note.midi;
    if (!max || note.midi > max) max = note.midi;
  }

  /** extend one octave in each direction */
  if (max) max = Math.min(max + 12, 127);
  if (min) min = Math.max(min - 12, 0);

  return { min: min || 0, max: max || 127 };
});

/** parameters */
export const start = atomWithStorage("start", { ...defaults.start });
export const drift = atomWithStorage("drift", { ...defaults.drift });
export const duration = atomWithStorage("duration", { ...defaults.duration });
export const velocity = atomWithStorage("velocity", { ...defaults.velocity });
export const options = atomWithStorage("options", { ...defaults.options });

/** guides */
export const pitchGuides = atom((get) =>
  range(get(pitchRange).min, get(pitchRange).max + 1).map((pitch) => ({
    y: (127 - pitch) * noteHeight,
    width: get(midi)?.durationTicks || 96 * 16,
    height: noteHeight,
    black: !![1, 3, 6, 8, 10].includes(pitch % 12),
  }))
);
export const beatGuides = atom((get) => {
  const beatGuides = [];

  /** get midi data */
  const ppq = get(midi)?.header.ppq || 96;
  const durationTicks = get(midi)?.durationTicks || ppq * 16;

  /** beat sub divisions */
  const subs = range(0, ppq, ppq / get(options).grid);

  /** create beats */
  for (let tick = 0; tick < durationTicks; tick += ppq) {
    for (const sub of subs) {
      const measure =
        get(midi)?.header.ticksToMeasures(tick + sub) ||
        (tick + sub) / (ppq * 4);

      beatGuides.push({
        x: tick + sub,
        y1: (127 - get(pitchRange).max) * noteHeight,
        y2: (127 - get(pitchRange).min) * noteHeight + noteHeight,
        type: measure % 1 === 0 ? "major" : sub === 0 ? "minor" : "sub",
      });
    }
  }

  return beatGuides;
});

/** drift curve */
export const driftCurve = atom((get) => {
  const durationTicks = get(midi)?.durationTicks || 0;

  /** list of ticks */
  const ticks = [];
  /** list of corresponding drift values */
  const values = [];

  /** generate random point every certain amount of ticks */
  const step = clamp(get(drift).step, 1, durationTicks);
  for (let tick = 0; tick <= durationTicks; tick += step) {
    ticks.push(tick);
    values.push(random("drift" + tick / step + get(drift).seed));
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
});

/** randomized midi */
export const humanized = atom((get) => {
  /** deep clone to avoid altering original midi */
  const humanizedMidi = get(midi)?.clone();

  if (!humanizedMidi) return;

  /** go through each track */
  for (const [trackIndex, track] of Object.entries(humanizedMidi.tracks)) {
    /** randomize start time */
    for (const [noteIndex, note] of Object.entries(track.notes)) {
      note.ticks =
        note.ticks +
        /** spread */
        random("start" + trackIndex + noteIndex + get(start).seed) *
          get(start).randomness +
        /** drift */
        (get(driftCurve)[note.ticks] || 0) * get(drift).amount +
        /** transform */
        get(start).shift;
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
          (other.midi === note.midi || !get(options).poly)
      );
      if (nextNote) nextNotes.set(note, nextNote);
    }

    /** legato-ize */
    if (get(options).legato)
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
    for (const [noteIndex, note] of Object.entries(track.notes))
      note.durationTicks = Math.round(
        (note.durationTicks +
          /** spread */
          random("duration" + trackIndex + noteIndex + get(duration).seed) *
            get(duration).randomness +
          /** transform */
          get(duration).shift) *
          get(duration).scale
      );

    /** enforce gaps */
    for (const note of track.notes) {
      /** lookup next note... */
      const nextNote = nextNotes.get(note);
      /** where next note starts */
      const nextTicks = nextNote?.ticks || get(midi)?.durationTicks || 0;
      /** limit overlap */
      if (note.ticks + note.durationTicks + get(options).gap >= nextTicks)
        note.durationTicks = nextTicks - note.ticks - get(options).gap;
      /** limit */
      note.durationTicks = clamp(
        note.durationTicks,
        0,
        (get(midi)?.durationTicks || 0) - note.ticks
      );
    }

    /** randomize velocity */
    for (const [noteIndex, note] of Object.entries(track.notes)) {
      note.velocity =
        /** spread */
        (note.velocity +
          random("velocity" + trackIndex + noteIndex + get(velocity).seed) *
            get(velocity).randomness +
          /** transform */
          get(velocity).shift) *
        get(velocity).scale;
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

/** reset parameters to defaults */
export const reset = () => {
  store.set(start, { ...defaults.start });
  store.set(drift, { ...defaults.drift });
  store.set(duration, { ...defaults.duration });
  store.set(velocity, { ...defaults.velocity });
  store.set(options, { ...defaults.options });
};

/** increment parameter seeds */
export const incSeed = () => {
  store.set(start, (value) => ({ ...value, seed: value.seed + 1 }));
  store.set(drift, (value) => ({ ...value, seed: value.seed + 1 }));
  store.set(duration, (value) => ({ ...value, seed: value.seed + 1 }));
  store.set(velocity, (value) => ({ ...value, seed: value.seed + 1 }));
};

/** load sample */
Midi.fromUrl("sample.mid").then((parsed) => {
  console.info(parsed);
  store.set(filename, "sample.mid");
  store.set(midi, parsed);
});
