import { useAtom } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaults, duration } from "@/state";

export default function Duration() {
  const [get, set] = useAtom(duration);

  return (
    <fieldset>
      <legend>Durations</legend>
      <Tooltip content="Amount of randomness. Max amount to shift note durations left/right, in ticks.">
        <Range
          label="Rand."
          min={0}
          max={10}
          step={1}
          value={get.randomness}
          defaultValue={defaults.duration.randomness}
          onChange={(value) =>
            set((state) => ({ ...state, randomness: value }))
          }
        />
      </Tooltip>
      <Tooltip content="Unique character of duration randomness.">
        <Range
          label="Seed"
          min={0}
          max={99}
          step={1}
          value={get.seed}
          defaultValue={defaults.duration.seed}
          onChange={(value) => set((state) => ({ ...state, seed: value }))}
        />
      </Tooltip>
      <Tooltip content="How much to shift all note durations left/right, in ticks.">
        <Range
          label="Shift"
          min={-10}
          max={10}
          step={1}
          value={get.shift}
          defaultValue={defaults.duration.shift}
          onChange={(value) => set((state) => ({ ...state, shift: value }))}
        />
      </Tooltip>
      <Tooltip content="How much to scale all note starts, as multiplier.">
        <Range
          label="Scale"
          min={0}
          max={2}
          step={0.01}
          value={get.scale}
          defaultValue={defaults.duration.scale}
          onChange={(value) => set((state) => ({ ...state, scale: value }))}
        />
      </Tooltip>
    </fieldset>
  );
}
