import seedrandom from "seedrandom";

/** cache of random numbers */
const cache: { [key: string]: number } = {};

/** deterministic random number between -1 and 1 based on string seed */
export const random = (_seed: (string | number)[], power = 1) => {
  const seed = _seed.join("-");
  /** cache key */
  const key = [seed, power].join("-");
  /** cached value */
  if (cache[key]) return cache[key];
  /** random function, 0 to 1 */
  const random = seedrandom(seed);
  /** new value, -1 to 1 */
  let value = -1 + 2 * random();
  /** raise to power, preserve sign */
  value = Math.sign(value) * Math.abs(value) ** power;
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
