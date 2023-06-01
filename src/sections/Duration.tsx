import Group from "@/components/Group";
import Range from "@/components/Range";
import { useState } from "@/global/state";

const Duration = () => (
  <Group label="Note duration">
    <Range
      label="Rand."
      min={0}
      max={20}
      step={1}
      value={useState((state) => state.duration.randomness)}
      onChange={(value) =>
        useState.setState((state) => ({
          duration: { ...state.duration, randomness: value },
        }))
      }
    />
    <Range
      label="Seed"
      min={0}
      max={100}
      step={1}
      value={useState((state) => state.duration.seed)}
      onChange={(value) =>
        useState.setState((state) => ({
          duration: { ...state.duration, seed: value },
        }))
      }
    />
    <Range
      label="Offset"
      min={-20}
      max={20}
      step={1}
      value={useState((state) => state.duration.offset)}
      onChange={(value) =>
        useState.setState((state) => ({
          duration: { ...state.duration, offset: value },
        }))
      }
    />
    <Range
      label="Scale"
      min={0}
      max={2}
      step={0.01}
      value={useState((state) => state.duration.scale)}
      onChange={(value) =>
        useState.setState((state) => ({
          duration: { ...state.duration, scale: value },
        }))
      }
    />
  </Group>
);

export default Duration;
