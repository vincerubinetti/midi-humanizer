import { useAtom } from "jotai";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import Group from "@/components/Group";
import Range from "@/components/Range";
import { defaults, options, reset } from "@/state";

const Options = () => {
  const [get, set] = useAtom(options);

  return (
    <Group label="Options">
      <Range
        label="Grid"
        min={1}
        max={9}
        step={1}
        value={get.grid}
        defaultValue={defaults.options.grid}
        onChange={(value) => set((state) => ({ ...state, grid: value }))}
      />
      <Checkbox
        label="Inc. Seed"
        value={get.incSeed}
        onChange={(value) => set((state) => ({ ...state, incSeed: value }))}
      />
      <Button onClick={reset}>Reset All</Button>
    </Group>
  );
};

export default Options;
