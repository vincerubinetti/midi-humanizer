import { useAtomValue } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaults, ppqAtom, setTrack, trackAtom } from "@/state";

export default function Start() {
  /** global state */
  const { start } = useAtomValue(trackAtom);
  const ppq = useAtomValue(ppqAtom);

  return (
    <fieldset>
      <legend>Starts</legend>
      <Tooltip content="Max amount to shift starts randomly, in ticks.">
        <Range
          label="Rand."
          min={-ppq / 4}
          max={ppq / 4}
          step={1}
          value={start.randomness}
          defaultValue={defaults.start.randomness}
          onChange={(value) =>
            setTrack((track) => {
              track.start.randomness = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="Unique character of randomness.">
        <Range
          label="Seed"
          min={0}
          max={99}
          step={1}
          value={start.seed}
          defaultValue={defaults.start.seed}
          onChange={(value) =>
            setTrack((track) => {
              track.start.seed = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="How much to shift all starts, in ticks.">
        <Range
          label="Shift"
          min={-ppq / 4}
          max={ppq / 4}
          step={1}
          value={start.shift}
          defaultValue={defaults.start.shift}
          onChange={(value) =>
            setTrack((track) => {
              track.start.shift = value;
            })
          }
        />
      </Tooltip>
    </fieldset>
  );
}
