import { useAtom } from "jotai";
import Checkbox from "@/components/Checkbox";
import Range from "@/components/Range";
import Select from "@/components/Select";
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
      <Tooltip content="Minimum amount of gap to leave between each note and the next note, in ticks.">
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
      <Tooltip content="Whether to extend each note to the next note, before randomizing.">
        <Checkbox
          label="Legato"
          value={get.legato}
          onChange={(value) => set((state) => ({ ...state, legato: value }))}
        />
      </Tooltip>
      <Tooltip content='Whether to treat notes as polyphonic. If on, "next note" in the "Gap" and "Legato" options means the next note of the same pitch. If off, it means the very next note in time, regardless of pitch.'>
        <Checkbox
          label="Poly."
          value={get.polyphonic}
          onChange={(value) =>
            set((state) => ({ ...state, polyphonic: value }))
          }
        />
      </Tooltip>
      <Tooltip content='How to distribute randomness. "Uniform" means evenly from -100% to 100%, "triangular" means more likely to be near 0%.'>
        <Select
          label="Dist."
          options={[
            { value: "uniform", label: "Uniform" },
            { value: "triangular", label: "Triangular" },
          ]}
          value={get.distribution}
          onChange={(value) =>
            set((state) => ({ ...state, distribution: value }))
          }
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
