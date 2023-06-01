import Group from "@/components/Group";
import Range from "@/components/Range";
import { useState } from "@/global/state";

const Start = () => (
  <Group label="Note start">
    <Range
      label="Rand."
      min={0}
      max={20}
      step={1}
      value={useState((state) => state.start.randomness)}
      onChange={(value) =>
        useState.setState((state) => ({
          start: { ...state.start, randomness: value },
        }))
      }
    />
    <Range
      label="Seed"
      min={0}
      max={100}
      step={1}
      value={useState((state) => state.start.seed)}
      onChange={(value) =>
        useState.setState((state) => ({
          start: { ...state.start, seed: value },
        }))
      }
    />
    <Range
      label="Offset"
      min={-20}
      max={20}
      step={1}
      value={useState((state) => state.start.offset)}
      onChange={(value) =>
        useState.setState((state) => ({
          start: { ...state.start, offset: value },
        }))
      }
    />
  </Group>
);

export default Start;
