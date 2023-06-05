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
        max={12}
        step={1}
        value={get.grid}
        defaultValue={defaults.options.grid}
        onChange={(value) => set((state) => ({ ...state, grid: value }))}
      />
      <Range
        label="Gap"
        tooltip="Minimum amount of gap to leave between each note and the next one, in ticks."
        min={0}
        max={20}
        step={1}
        value={get.gap}
        defaultValue={defaults.options.gap}
        onChange={(value) => set((state) => ({ ...state, gap: value }))}
      />
      <Checkbox
        label="Legato"
        tooltip="Whether to extend each note to the next one, before randomizing."
        value={get.legato}
        onChange={(value) => set((state) => ({ ...state, legato: value }))}
      />
      <Checkbox
        label="Poly."
        tooltip='Whether to treat notes as polyphonic. If on, "next note" in the "Gap" and "Legato" options means the next note of the same pitch. If off, it means the next note in time, regardless of pitch.'
        value={get.poly}
        onChange={(value) => set((state) => ({ ...state, poly: value }))}
      />
      <Checkbox
        label="Seed+"
        tooltip="Whether to automatically add one to each seed parameter when a new file is loaded. Useful if you're working on lots of similar files and don't want them to have the same randomness."
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
