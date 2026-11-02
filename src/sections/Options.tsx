import { useAtom } from "jotai";
import Checkbox from "@/components/Checkbox";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaults, options, reset } from "@/state";

export default function Options() {
  const [get, set] = useAtom(options);

  return (
    <fieldset>
      <legend>Options</legend>
      <Tooltip content="How many subdivisions per beat to show in the piano roll.">
        <Range
          label="Grid"
          min={1}
          max={6}
          step={1}
          value={get.grid}
          defaultValue={defaults.options.grid}
          onChange={(value) => set((state) => ({ ...state, grid: value }))}
        />
      </Tooltip>
      <Tooltip content="Minimum amount of gap to leave between each note and the next one, in ticks.">
        <Range
          label="Gap"
          min={0}
          max={10}
          step={1}
          value={get.gap}
          defaultValue={defaults.options.gap}
          onChange={(value) => set((state) => ({ ...state, gap: value }))}
        />
      </Tooltip>
      <Tooltip content="Whether to extend each note to the next one, before randomizing.">
        <Checkbox
          label="Legato"
          value={get.legato}
          onChange={(value) => set((state) => ({ ...state, legato: value }))}
        />
      </Tooltip>
      <Tooltip content='Whether to treat notes as polyphonic. If on, "next note" in the "Gap" and "Legato" options means the next note of the same pitch. If off, it means the next note in time, regardless of pitch.'>
        <Checkbox
          label="Poly."
          value={get.poly}
          onChange={(value) => set((state) => ({ ...state, poly: value }))}
        />
      </Tooltip>
      <Tooltip content="Whether to automatically add one to each seed parameter when a new file is loaded. Useful if you're working on lots of similar files and don't want them to have the same randomness.">
        <Checkbox
          label="Seed+"

          value={get.incSeed}
          onChange={(value) => set((state) => ({ ...state, incSeed: value }))}
        />
      </Tooltip>
      <Tooltip content="Reset all parameters to defaults.">
        <button className="col-span-full" onClick={reset}>
          Reset All
        </button>
      </Tooltip>
    </fieldset>
  );
}
