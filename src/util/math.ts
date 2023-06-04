import seedrandom from "seedrandom";

const map: { [key: string]: number } = {};

/** deterministic random number between -1 and 1 based on string seed */
export const random = (seed: string) => {
  if (map[seed]) return map[seed];
  else return (map[seed] = -1 + seedrandom(seed)() * 2);
};
