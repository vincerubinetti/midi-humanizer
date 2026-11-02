import { useAtom } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaults, velocity } from "@/state";

export default function Velocity() {
  const [get, set] = useAtom(velocity);

  return (
    <fieldset>
      <legend>Velocities</legend>
      <Tooltip content="Amount of randomness. Max amount to shift note velocities up/down, in range of 0-1.">
        <Range
          label="Rand."
          min={0}
          max={0.5}
          step={0.01}
          value={get.randomness}
          defaultValue={defaults.velocity.randomness}
          onChange={(value) =>
            set((state) => ({ ...state, randomness: value }))
          }
        />
      </Tooltip>
      <Tooltip content="Unique character of velocity randomness.">
        <Range
          label="Seed"
          min={0}
          max={99}
          step={1}
          value={get.seed}
          defaultValue={defaults.velocity.seed}
          onChange={(value) => set((state) => ({ ...state, seed: value }))}
        />
      </Tooltip>
      <Tooltip content="How much to shift all note velocities up/down, in range of 0-1.">
        <Range
          label="Shift"
          min={-1}
          max={1}
          step={0.01}
          value={get.shift}
          defaultValue={defaults.velocity.shift}
          onChange={(value) => set((state) => ({ ...state, shift: value }))}
        />
      </Tooltip>
      <Tooltip content="How much to scale all note velocities, as multiplier.">
        <Range
          label="Scale"
          min={0}
          max={2}
          step={0.01}
          value={get.scale}
          defaultValue={defaults.velocity.scale}
          onChange={(value) => set((state) => ({ ...state, scale: value }))}
        />
      </Tooltip>
    </fieldset>
  );
}
