import { useAtomValue } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaultsAtom, setTrack, trackAtom } from "@/state";

export default function Velocity() {
  /** global state */
  const defaults = useAtomValue(defaultsAtom);
  const { velocity } = useAtomValue(trackAtom);

  return (
    <fieldset>
      <legend>Velocities</legend>
      <Tooltip content="Max amount to shift velocities randomly, in steps.">
        <Range
          label="Rand."
          min={-127}
          max={127}
          step={1}
          value={velocity.randomness}
          defaultValue={defaults.velocity.randomness}
          onChange={(value) =>
            setTrack((track) => {
              track.velocity.randomness = value;
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
          value={velocity.seed}
          defaultValue={defaults.velocity.seed}
          onChange={(value) =>
            setTrack((track) => {
              track.velocity.seed = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="How much to shift all velocities, in steps.">
        <Range
          label="Shift"
          min={-127}
          max={127}
          step={1}
          value={velocity.shift}
          defaultValue={defaults.velocity.shift}
          onChange={(value) =>
            setTrack((track) => {
              track.velocity.shift = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="How much to multiply all velocities.">
        <Range
          label="Scale"
          min={0}
          max={2}
          step={0.1}
          value={velocity.scale}
          defaultValue={defaults.velocity.scale}
          onChange={(value) =>
            setTrack((track) => {
              track.velocity.scale = value;
            })
          }
        />
      </Tooltip>
    </fieldset>
  );
}
