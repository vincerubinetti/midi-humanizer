import { useAtom } from "jotai";
import Checkbox from "@/components/Checkbox";
import Range from "@/components/Range";
import Select from "@/components/Select";
import Tooltip from "@/components/Tooltip";
import { defaults, setTrack, track } from "@/state";

export default function Options() {
  /** global state */
  const [getTrack] = useAtom(track);
  const get = getTrack.options;

  return (
    <fieldset>
      <legend>Options</legend>
      <Tooltip content="How many subdivisions per beat to show in piano roll.">
        <Range
          label="Grid"
          min={1}
          max={6}
          step={1}
          value={get.grid}
          defaultValue={defaults.options.grid}
          onChange={(value) =>
            setTrack((track) => {
              track.options.grid = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="Minimum amount of gap to leave between each note and next note, in ticks.">
        <Range
          label="Gap"
          min={0}
          max={10}
          step={1}
          value={get.gap}
          defaultValue={defaults.options.gap}
          onChange={(value) =>
            setTrack((track) => {
              track.options.gap = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="Whether to extend each note to next note, before randomizing.">
        <Checkbox
          label="Legato"
          value={get.legato}
          onChange={(value) =>
            setTrack((track) => {
              track.options.legato = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content='Whether to treat notes as polyphonic. If on, "next note" in "Gap" and "Legato" options means next note of same pitch. If off, it means very next note in time, regardless of pitch.'>
        <Checkbox
          label="Poly."
          value={get.polyphonic}
          onChange={(value) =>
            setTrack((track) => {
              track.options.polyphonic = value;
            })
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
            setTrack((track) => {
              track.options.distribution = value;
            })
          }
        />
      </Tooltip>
    </fieldset>
  );
}
