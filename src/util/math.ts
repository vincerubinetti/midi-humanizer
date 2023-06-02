import seedrandom from "seedrandom";

const map: { [key: string]: number } = {};

export const random = (seed: string) => {
  if (map[seed]) return map[seed];
  else return (map[seed] = -1 + seedrandom(seed)() * 2);
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
