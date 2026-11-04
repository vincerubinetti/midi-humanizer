import seedrandom from "seedrandom";

/** cache of random numbers */
const cache: { [key: string]: number } = {};

/** deterministic random number between -1 and 1 based on string seed */
export const random = (seed: (string | number)[], distribution: string) => {
  /** cache key */
  const key = [...seed, distribution].join("-");
  /** cached value */
  if (cache[key]) return cache[key];
  /** random function, 0 to 1 */
  const random = seedrandom(key);
  /** new value, -1 to 1 */
  let value = 0;
  if (distribution === "triangular")
    value = (-1 + 2 * random()) * (-1 + 2 * random());
  else value = -1 + 2 * random();
  /** set cache */
  cache[key] = value;
  return value;
};

/** round to multiple */
export const round = (
  value: number,
  multiple = 1,
  method: "round" | "floor" | "ceil" = "round",
) => Math[method](value / multiple) * multiple;
