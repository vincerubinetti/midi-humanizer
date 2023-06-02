import Group from "@/components/Group";
import Range from "@/components/Range";
import { defaults, useState } from "@/global/state";

const Options = () => {
  const reset = useState((state) => state.reset);

  return (
    <Group label="Options">
      <Range
        label="Grid"
        min={1}
        max={9}
        step={1}
        value={useState((state) => state.options.grid)}
        defaultValue={defaults.options.grid}
        onChange={(value) =>
          useState.setState((state) => ({
            options: { ...state.options, grid: value },
          }))
        }
      />
      <button onClick={reset}>Reset All</button>
    </Group>
  );
};

export default Options;
