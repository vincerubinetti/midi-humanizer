import { useAtom } from "jotai";
import Group from "@/components/Group";
import Range from "@/components/Range";
import { defaults, drift } from "@/state";

const Drift = () => {
  const [get, set] = useAtom(drift);

  return (
    <Group label="Note start drift">
      <Range
        label="Amnt."
        min={0}
        max={20}
        step={1}
        value={get.amount}
        defaultValue={defaults.drift.amount}
        onChange={(value) => set((state) => ({ ...state, amount: value }))}
      />
      <Range
        label="Seed"
        min={0}
        max={999}
        step={1}
        value={get.seed}
        defaultValue={defaults.drift.seed}
        onChange={(value) => set((state) => ({ ...state, seed: value }))}
      />
      <Range
        label="Step"
        min={2 ** 2}
        max={2 ** 11}
        step={1}
        value={get.step}
        defaultValue={defaults.drift.step}
        onChange={(value) => set((state) => ({ ...state, step: value }))}
      />
    </Group>
  );
};
export default Drift;
