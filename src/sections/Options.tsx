import { useAtomValue } from "jotai";
import Checkbox from "@/components/Checkbox";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaultsAtom, ppqAtom, setTrack, trackAtom } from "@/state";

export default function Options() {
  /** global state */
  const defaults = useAtomValue(defaultsAtom);
  const { options } = useAtomValue(trackAtom);
  const ppq = useAtomValue(ppqAtom);

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
      <Tooltip content="Minimum amount of gap to leave between note and next note, in ticks. Set to -1 to not de-overlap at all.">
        <Range
          label="Gap"
          min={-1}
          max={ppq / 4}
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
      <Tooltip content='If on, "next note" means next note of same pitch. If off, it means next note in time, regardless of pitch.'>
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
      <Tooltip content="Power to raise random numbers by.">
        <Range
          label="Power"
          min={0}
          max={4}
          step={0.1}
          value={options.power}
          defaultValue={defaults.options.power}
          onChange={(value) =>
            setTrack((track) => {
              track.options.power = value;
            })
          }
        />
      </Tooltip>
    </fieldset>
  );
}
