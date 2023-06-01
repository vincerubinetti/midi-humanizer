import { create } from "zustand";
import { Midi } from "@tonejs/midi";

export type State = {
  midi: Midi | undefined;
  pitches: {
    x: number;
    y: number;
    width: number;
    height: number;
    black: boolean;
  }[];
  beats: { x: number; y1: number; y2: number; major: boolean }[];
  start: { randomness: number; seed: number; offset: number; };
  duration: { randomness: number; seed: number; offset: number; scale: number };
};

export const thickness = 10;

const getPitches = (midi?: Midi) =>
  Array(128)
    .fill({})
    .map((_, pitch) => ({
      x: 0,
      y: -pitch * thickness - thickness,
      width: midi ? midi.durationTicks : 96 * 16,
      height: thickness,
      black: !![1, 3, 6, 8, 10].includes(pitch % 12),
    }));

const getBeats = (midi?: Midi) =>
  Array(midi ? midi.durationTicks / midi.header.ppq : 16)
    .fill({})
    .map((_, beat) => ({
      x: beat * (midi ? midi.header.ppq : 96),
      y1: -128 * thickness,
      y2: 0,
      major:
        beat % (midi ? midi.header.timeSignatures[0].timeSignature[0] : 4) ===
        0,
    }));

export const useState = create<State>(() => ({
  midi: undefined,
  pitches: getPitches(),
  beats: getBeats(),
  start: { randomness: 0, seed: 0, offset: 0 },
  duration: { randomness: 0, seed: 0, offset: 0, scale: 1 },
}));

Midi.fromUrl("congas.mid").then((midi) => {
  useState.setState({ midi, pitches: getPitches(midi), beats: getBeats(midi) });
});
