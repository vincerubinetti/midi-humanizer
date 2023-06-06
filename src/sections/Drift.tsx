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
        tooltip="Amount that drift affects note starts, in ticks."
        min={0}
        max={10}
        step={1}
        value={get.amount}
        defaultValue={defaults.drift.amount}
        onChange={(value) => set((state) => ({ ...state, amount: value }))}
      />
      <Range
        label="Seed"
        tooltip="Unique character of drift randomness."
        min={0}
        max={99}
        step={1}
        value={get.seed}
        defaultValue={defaults.drift.seed}
        onChange={(value) => set((state) => ({ ...state, seed: value }))}
      />
      <Range
        label="Step"
        tooltip="Start drifting toward new value every this number of ticks. Lower = faster, higher = slower."
        min={96 * 0.5}
        max={96 * 10}
        step={1}
        value={get.step}
        defaultValue={defaults.drift.step}
        onChange={(value) => set((state) => ({ ...state, step: value }))}
      />
    </Group>
  );
};
export default Drift;
