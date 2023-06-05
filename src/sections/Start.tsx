import { useAtom } from "jotai";
import Group from "@/components/Group";
import Range from "@/components/Range";
import { defaults, start } from "@/state";

const Start = () => {
  const [get, set] = useAtom(start);

  return (
    <Group label="Note starts">
      <Range
        label="Rand."
        tooltip="Amount of randomness. Max amount to shift note starts left/right, in ticks."
        min={0}
        max={20}
        step={1}
        value={get.randomness}
        defaultValue={defaults.start.randomness}
        onChange={(value) => set((state) => ({ ...state, randomness: value }))}
      />
      <Range
        label="Seed"
        tooltip="Unique character of note start randomness."
        min={0}
        max={99}
        step={1}
        value={get.seed}
        defaultValue={defaults.start.seed}
        onChange={(value) => set((state) => ({ ...state, seed: value }))}
      />
      <Range
        label="Shift"
        tooltip="How much to shift all note starts left/right, in ticks."
        min={-20}
        max={20}
        step={1}
        value={get.shift}
        defaultValue={defaults.start.shift}
        onChange={(value) => set((state) => ({ ...state, shift: value }))}
      />
    </Group>
  );
};

export default Start;
