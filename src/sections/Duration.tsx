import { useAtomValue } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaultsAtom, ppqAtom, setTrack, trackAtom } from "@/state";

export default function Duration() {
  /** global state */
  const defaults = useAtomValue(defaultsAtom);
  const { duration } = useAtomValue(trackAtom);
  const ppq = useAtomValue(ppqAtom);

  return (
    <fieldset>
      <legend>Durations</legend>
      <Tooltip content="Max amount to shift durations randomly, in ticks.">
        <Range
          label="Rand."
          min={-ppq / 4}
          max={ppq / 4}
          step={1}
          value={duration.randomness}
          defaultValue={defaults.duration.randomness}
          onChange={(value) =>
            setTrack((track) => {
              track.duration.randomness = value;
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
          value={duration.seed}
          defaultValue={defaults.duration.seed}
          onChange={(value) =>
            setTrack((track) => {
              track.duration.seed = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="How much to shift all durations, in ticks.">
        <Range
          label="Shift"
          min={-ppq / 4}
          max={ppq / 4}
          step={1}
          value={duration.shift}
          defaultValue={defaults.duration.shift}
          onChange={(value) =>
            setTrack((track) => {
              track.duration.shift = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="How much to multiply all durations.">
        <Range
          label="Scale"
          min={0}
          max={2}
          step={0.01}
          value={duration.scale}
          defaultValue={defaults.duration.scale}
          onChange={(value) =>
            setTrack((track) => {
              track.duration.scale = value;
            })
          }
        />
      </Tooltip>
    </fieldset>
  );
}
