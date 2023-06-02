import * as d3 from "d3";
import { cloneDeep } from "lodash";
import { create } from "zustand";
import computed from "zustand-computed";
import { Midi } from "@tonejs/midi";
import { Note } from "@tonejs/midi/dist/Note";
import { clamp, random } from "@/util/math";

export const thickness = 10;

export const defaults = {
  filename: "",
  start: { randomness: 0, seed: 0, offset: 0 },
  drift: { amount: 0, step: 96 * 4, seed: 0 },
  duration: { randomness: 0, seed: 0, offset: 0, scale: 1 },
  velocity: { randomness: 0, seed: 0, offset: 0, scale: 1 },
  options: { grid: 4 },
  pitches: [],
  beats: [],
  driftCurve: [],
  humanizedNotes: [],
};

const pitches = (state: State) =>
  Array(128)
    .fill({})
    .map((_, pitch) => ({
      x: 0,
      y: -pitch * thickness - thickness,
      width: state.midi ? state.midi.durationTicks : 96 * 16,
      height: thickness,
      black: !![1, 3, 6, 8, 10].includes(pitch % 12),
    }));

const beats = (state: State) => {
  const beats = [];

  const ppq = state.midi?.header.ppq || 96;
  const durationTicks = state.midi?.durationTicks || ppq * 16;

  const subs = Array(state.options.grid)
    .fill(0)
    .map((_, index) => Math.floor((index / state.options.grid) * ppq));

  for (let tick = 0; tick < durationTicks; tick += ppq) {
    for (const sub of subs) {
      const measure =
        state.midi?.header.ticksToMeasures(tick + sub) ||
        (tick + sub) / (ppq * 4);
      beats.push({
        x: tick + sub,
        y1: -128 * thickness,
        y2: 0,
        type: measure % 1 === 0 ? "major" : sub === 0 ? "minor" : "sub",
      });
    }
  }

  return beats;
};

const driftCurve = (state: State) => {
  const durationTicks = state.midi?.durationTicks || 0;
  const ticks = [];
  const values = [];

  const step = Math.min(durationTicks, state.drift.step) || 1;

  for (let tick = 0; tick <= durationTicks; tick += step) {
    ticks.push(tick);
    values.push(
      random("drift" + tick / step + state.drift.seed) * state.drift.amount
    );
  }

  const scale = d3
    .scaleLinear()
    .domain(ticks)
    .range(values)
    .interpolate((a, b) => (t) => {
      const y = 0.5 - Math.cos(Math.PI * t) / 2;
      return a + (b - a) * y;
    });

  return Array(durationTicks)
    .fill({})
    .map((_, index) => scale(index));
};

const humanizedNotes = (state: State): Note[] => {
  if (!state.midi) return [];

  const drifts = driftCurve(state);

  const notes = cloneDeep(state.midi.tracks[0].notes);

  for (const [index, note] of Object.entries(notes)) {
    let newTicks =
      note.ticks +
      random("start" + index + state.start.seed) * state.start.randomness +
      state.start.offset +
      (drifts[note.ticks] || 0);
    let newDuration =
      (note.durationTicks +
        random("duration" + index + state.duration.seed) *
          state.duration.randomness +
        state.duration.offset) *
      state.duration.scale;
    let newVelocity =
      (note.velocity +
        random("velocity" + index + state.velocity.seed) *
          state.velocity.randomness +
        state.velocity.offset) *
      state.velocity.scale;

    if (newTicks < 0) newTicks = 0;
    if (newTicks > state.midi.durationTicks)
      newTicks = state.midi.durationTicks;
    if (newDuration < 0) newDuration = 0;
    if (newDuration + newTicks > state.midi.durationTicks)
      newDuration = Math.max(0, state.midi.durationTicks - newTicks);
    newVelocity = clamp(newVelocity, 0, 1);

    note.ticks = Math.round(newTicks);
    note.durationTicks = Math.round(newDuration);
    note.velocity = newVelocity;
  }

  notes.sort((a, b) => a.ticks - b.ticks);

  for (const note of notes)
    for (const otherNote of notes)
      if (
        note.midi === otherNote.midi &&
        note.ticks < otherNote.ticks &&
        note.ticks + note.durationTicks >= otherNote.ticks
      )
        note.durationTicks = otherNote.ticks - note.ticks;

  return notes;
};

export const useState = create<State>()(
  computed(
    (set) => ({
      midi: undefined,
      ...defaults,
      reset: () => set(defaults),
    }),

    (state: State) => ({
      pitches: pitches(state),
      beats: beats(state),
      driftCurve: driftCurve(state),
      humanizedNotes: humanizedNotes(state),
    })
  )
);

export type State = {
  filename: string;
  midi: Midi | undefined;
  start: { randomness: number; seed: number; offset: number };
  drift: { amount: number; step: number; seed: number };
  duration: { randomness: number; seed: number; offset: number; scale: number };
  velocity: { randomness: number; seed: number; offset: number; scale: number };
  options: { grid: number };
  reset: () => void;

  pitches: ReturnType<typeof pitches>;
  beats: ReturnType<typeof beats>;
  driftCurve: ReturnType<typeof driftCurve>;
  humanizedNotes: ReturnType<typeof humanizedNotes>;
};
