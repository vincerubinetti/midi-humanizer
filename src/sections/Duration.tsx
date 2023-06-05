import { useAtom } from "jotai";
import Group from "@/components/Group";
import Range from "@/components/Range";
import { defaults, duration } from "@/state";

const Duration = () => {
  const [get, set] = useAtom(duration);

  return (
    <Group label="Note durations">
      <Range
        label="Rand."
        tooltip="Amount of randomness. Max amount to shift note durations left/right, in ticks."
        min={0}
        max={20}
        step={1}
        value={get.randomness}
        defaultValue={defaults.duration.randomness}
        onChange={(value) => set((state) => ({ ...state, randomness: value }))}
      />
      <Range
        label="Seed"
        tooltip="Unique character of duration randomness."
        min={0}
        max={99}
        step={1}
        value={get.seed}
        defaultValue={defaults.duration.seed}
        onChange={(value) => set((state) => ({ ...state, seed: value }))}
      />
      <Range
        label="Shift"
        tooltip="How much to shift all note durations left/right, in ticks."
        min={-20}
        max={20}
        step={1}
        value={get.shift}
        defaultValue={defaults.duration.shift}
        onChange={(value) => set((state) => ({ ...state, shift: value }))}
      />
      <Range
        label="Scale"
        tooltip="How much to scale all note starts, as multiplier."
        min={0}
        max={2}
        step={0.01}
        value={get.scale}
        defaultValue={defaults.duration.scale}
        onChange={(value) => set((state) => ({ ...state, scale: value }))}
      />
    </Group>
  );
};

export default Duration;
