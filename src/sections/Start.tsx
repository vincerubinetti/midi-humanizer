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
        min={0}
        max={20}
        step={1}
        value={get.randomness}
        defaultValue={defaults.start.randomness}
        onChange={(value) => set((state) => ({ ...state, randomness: value }))}
      />
      <Range
        label="Seed"
        min={0}
        max={999}
        step={1}
        value={get.seed}
        defaultValue={defaults.start.seed}
        onChange={(value) => set((state) => ({ ...state, seed: value }))}
      />
      <Range
        label="Offset"
        min={-20}
        max={20}
        step={1}
        value={get.offset}
        defaultValue={defaults.start.offset}
        onChange={(value) => set((state) => ({ ...state, offset: value }))}
      />
    </Group>
  );
};

export default Start;
