import Group from "@/components/Group";
import Range from "@/components/Range";
import { defaults, useState } from "@/global/state";

const Drift = () => (
  <Group label="Note start drift">
    <Range
      label="Amnt."
      min={0}
      max={20}
      step={1}
      value={useState((state) => state.drift.amount)}
      defaultValue={defaults.drift.amount}
      onChange={(value) =>
        useState.setState((state) => ({
          drift: { ...state.drift, amount: value },
        }))
      }
    />
    <Range
      label="Step"
      min={8}
      max={96 * 8}
      step={1}
      value={useState((state) => state.drift.step)}
      defaultValue={defaults.drift.step}
      onChange={(value) =>
        useState.setState((state) => ({
          drift: { ...state.drift, step: value },
        }))
      }
    />
    <Range
      label="Seed"
      min={0}
      max={999}
      step={1}
      value={useState((state) => state.drift.seed)}
      defaultValue={defaults.drift.seed}
      onChange={(value) =>
        useState.setState((state) => ({
          drift: { ...state.drift, seed: value },
        }))
      }
    />
  </Group>
);

export default Drift;
