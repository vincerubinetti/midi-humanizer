import { useAtom } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaults, setTrack, track } from "@/state";

export default function Duration() {
  /** global state */
  const [getTrack] = useAtom(track);
  const get = getTrack.duration;

  return (
    <fieldset>
      <legend>Durations</legend>
      <Tooltip content="Max amount to shift durations left/right randomly, in ticks.">
        <Range
          label="Rand."
          min={-10}
          max={10}
          step={1}
          value={get.randomness}
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
          value={get.seed}
          defaultValue={defaults.duration.seed}
          onChange={(value) =>
            setTrack((track) => {
              track.duration.seed = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="How much to shift all durations left/right, in ticks.">
        <Range
          label="Shift"
          min={-10}
          max={10}
          step={1}
          value={get.shift}
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
          value={get.scale}
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
