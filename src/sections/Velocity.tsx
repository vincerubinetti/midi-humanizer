import Group from "@/components/Group";
import Range from "@/components/Range";
import { defaults, useState } from "@/global/state";

const Velocity = () => (
  <Group label="Note velocities">
    <Range
      label="Rand."
      min={0}
      max={1}
      step={0.01}
      value={useState((state) => state.velocity.randomness)}
      defaultValue={defaults.velocity.randomness}
      onChange={(value) =>
        useState.setState((state) => ({
          velocity: { ...state.velocity, randomness: value },
        }))
      }
    />
    <Range
      label="Seed"
      min={0}
      max={100}
      step={1}
      value={useState((state) => state.velocity.seed)}
      defaultValue={defaults.velocity.seed}
      onChange={(value) =>
        useState.setState((state) => ({
          velocity: { ...state.velocity, seed: value },
        }))
      }
    />
    <Range
      label="Offset"
      min={-1}
      max={1}
      step={0.01}
      value={useState((state) => state.velocity.offset)}
      defaultValue={defaults.velocity.offset}
      onChange={(value) =>
        useState.setState((state) => ({
          velocity: { ...state.velocity, offset: value },
        }))
      }
    />
    <Range
      label="Scale"
      min={0}
      max={2}
      step={0.01}
      value={useState((state) => state.velocity.scale)}
      defaultValue={defaults.velocity.scale}
      onChange={(value) =>
        useState.setState((state) => ({
          velocity: { ...state.velocity, scale: value },
        }))
      }
    />
  </Group>
);

export default Velocity;
