import { useAtom } from "jotai";
import Range from "@/components/Range";
import Tooltip from "@/components/Tooltip";
import { defaults, setTrack, track } from "@/state";

export default function Velocity() {
  /** global state */
  const [getTrack] = useAtom(track);
  const get = getTrack.velocity;

  return (
    <fieldset>
      <legend>Velocities</legend>
      <Tooltip content="Max amount to shift velocities up/down randomly.">
        <Range
          label="Rand."
          min={-1}
          max={1}
          step={0.01}
          value={get.randomness}
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
          value={get.seed}
          defaultValue={defaults.velocity.seed}
          onChange={(value) =>
            setTrack((track) => {
              track.velocity.seed = value;
            })
          }
        />
      </Tooltip>
      <Tooltip content="How much to shift all velocities up/down.">
        <Range
          label="Shift"
          min={-1}
          max={1}
          step={0.01}
          value={get.shift}
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
          step={0.01}
          value={get.scale}
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
