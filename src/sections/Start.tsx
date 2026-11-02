import { useAtom } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaults, start } from "@/state";

export default function Start() {
  const [get, set] = useAtom(start);

  return (
    <fieldset>
      <legend>Starts</legend>
      <Tooltip content="Amount of randomness. Max amount to shift note starts left/right, in ticks.">
        <Range
          label="Rand."
          min={0}
          max={10}
          step={1}
          value={get.randomness}
          defaultValue={defaults.start.randomness}
          onChange={(value) =>
            set((state) => ({ ...state, randomness: value }))
          }
        />
      </Tooltip>
      <Tooltip content="Unique character of note start randomness.">
        <Range
          label="Seed"
          min={0}
          max={99}
          step={1}
          value={get.seed}
          defaultValue={defaults.start.seed}
          onChange={(value) => set((state) => ({ ...state, seed: value }))}
        />
      </Tooltip>
      <Tooltip content="How much to shift all note starts left/right, in ticks.">
        <Range
          label="Shift"
          min={-10}
          max={10}
          step={1}
          value={get.shift}
          defaultValue={defaults.start.shift}
          onChange={(value) => set((state) => ({ ...state, shift: value }))}
        />
      </Tooltip>
    </fieldset>
  );
}
