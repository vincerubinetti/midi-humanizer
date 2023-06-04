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
        tooltip="How many subdivisions per beat to show in the piano roll."
        min={1}
        max={9}
        step={1}
        value={get.grid}
        defaultValue={defaults.options.grid}
        onChange={(value) => set((state) => ({ ...state, grid: value }))}
      />
      <Checkbox
        label="Inc. Seed"
        tooltip="Whether to automatically increment each seed parameter when a new file is loaded. Useful when working on lots of similar files and don't want them to have the same randomness."
        value={get.incSeed}
        onChange={(value) => set((state) => ({ ...state, incSeed: value }))}
      />
      <Button data-tooltip="Reset all parameters to defaults." onClick={reset}>
        Reset All
      </Button>
    </Group>
  );
};

export default Options;
