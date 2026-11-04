import { useAtomValue } from "jotai";
import Checkbox from "@/components/Checkbox";
import Range from "@/components/Range";
import Select from "@/components/Select";
import Tooltip from "@/components/Tooltip";
import { defaults, setTrack, trackAtom } from "@/state";

export default function Options() {
  /** global state */
  const { options } = useAtomValue(trackAtom);

  return (
    <fieldset>
      <legend>Options</legend>
      <Tooltip content="How many subdivisions per beat to show.">
        <Range
          label="Grid"
          min={1}
          max={6}
          step={1}
          value={options.grid}
          defaultValue={defaults.options.grid}
          onChange={(value) =>
            setTrack((track) => {
              track.options.grid = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="Minimum amount of gap to leave between notes, in ticks.">
        <Range
          label="Gap"
          min={0}
          max={10}
          step={1}
          value={options.gap}
          defaultValue={defaults.options.gap}
          onChange={(value) =>
            setTrack((track) => {
              track.options.gap = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="Whether to extend each note to next note before randomizing.">
        <Checkbox
          label="Legato"
          value={options.legato}
          onChange={(value) =>
            setTrack((track) => {
              track.options.legato = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content='Whether to treat notes as polyphonic. If on, "next note" in "Gap" and "Legato" options means next note of same pitch. If off, it means next note in time, regardless of pitch.'>
        <Checkbox
          label="Poly."
          value={options.polyphonic}
          onChange={(value) =>
            setTrack((track) => {
              track.options.polyphonic = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="How to distribute randomness. Uniform = evenly from -100% to 100%, triangular = more likely to be near 0%.">
        <Select
          label="Dist."
          options={[
            { value: "uniform", label: "Uniform" },
            { value: "triangular", label: "Triangular" },
          ]}
          value={options.distribution}
          onChange={(value) =>
            setTrack((track) => {
              track.options.distribution = value;
            })
          }
        />
      </Tooltip>
    </fieldset>
  );
}
