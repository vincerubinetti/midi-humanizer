import { useAtom } from "jotai";
import Group from "@/components/Group";
import Range from "@/components/Range";
import { defaults, velocity } from "@/state";

const Velocity = () => {
  const [get, set] = useAtom(velocity);

  return (
    <Group label="Note velocities">
      <Range
        label="Rand."
        min={0}
        max={1}
        step={0.01}
        value={get.randomness}
        defaultValue={defaults.velocity.randomness}
        onChange={(value) => set((state) => ({ ...state, randomness: value }))}
      />
      <Range
        label="Seed"
        min={0}
        max={999}
        step={1}
        value={get.seed}
        defaultValue={defaults.velocity.seed}
        onChange={(value) => set((state) => ({ ...state, seed: value }))}
      />
      <Range
        label="Offset"
        min={-1}
        max={1}
        step={0.01}
        value={get.offset}
        defaultValue={defaults.velocity.offset}
        onChange={(value) => set((state) => ({ ...state, offset: value }))}
      />
      <Range
        label="Scale"
        min={0}
        max={2}
        step={0.01}
        value={get.scale}
        defaultValue={defaults.velocity.scale}
        onChange={(value) => set((state) => ({ ...state, scale: value }))}
      />
    </Group>
  );
};

export default Velocity;
