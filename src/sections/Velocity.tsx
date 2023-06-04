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
        tooltip="Amount of randomness. Max amount to shift note velocities up/down, in range of 0-1."
        min={0}
        max={1}
        step={0.01}
        value={get.randomness}
        defaultValue={defaults.velocity.randomness}
        onChange={(value) => set((state) => ({ ...state, randomness: value }))}
      />
      <Range
        label="Seed"
        tooltip="Unique character of velocity randomness."
        min={0}
        max={999}
        step={1}
        value={get.seed}
        defaultValue={defaults.velocity.seed}
        onChange={(value) => set((state) => ({ ...state, seed: value }))}
      />
      <Range
        label="Shift"
        tooltip="How much to shift all note velocities up/down, in range of 0-1."
        min={-1}
        max={1}
        step={0.01}
        value={get.shift}
        defaultValue={defaults.velocity.shift}
        onChange={(value) => set((state) => ({ ...state, shift: value }))}
      />
      <Range
        label="Scale"
        tooltip="How much to scale all note velocities, as multiplier."
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
