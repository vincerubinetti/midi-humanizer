import { create } from "zustand";
import { Midi } from "@tonejs/midi";

export type State = {
  midi: Midi | undefined;
  start: { randomness: number; seed: number; offset: number };
  drift: { amount: number; step: number; seed: number };
  duration: { randomness: number; seed: number; offset: number; scale: number };
  velocity: { randomness: number; seed: number; offset: number; scale: number };
  options: { grid: number };
  reset: () => void;
};

export const thickness = 10;

export const defaults = {
  start: { randomness: 0, seed: 0, offset: 0 },
  drift: { amount: 0, step: 96 * 4, seed: 0 },
  duration: { randomness: 0, seed: 0, offset: 0, scale: 1 },
  velocity: { randomness: 0, seed: 0, offset: 0, scale: 1 },
  options: { grid: 4 },
};

export const useState = create<State>((set) => ({
  midi: undefined,
  ...defaults,
  reset: () => set(defaults),
}));

Midi.fromUrl("congas.mid").then((midi) => {
  useState.setState({ midi });
});
