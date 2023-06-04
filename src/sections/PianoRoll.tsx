import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { useAtom } from "jotai";
import {
  beatGuides,
  drift,
  driftCurve,
  humanized,
  midi,
  pitchGuides,
  track,
} from "@/state";
import { useSize } from "@/util/hooks";
import classes from "./PianoRoll.module.css";

export const noteHeight = 10;

const PianoRoll = () => {
  const topPanel = useSize<SVGSVGElement>();
  const bottomPanel = useSize<SVGSVGElement>();
  const topPanelView = useRef<SVGGElement>(null);
  const bottomPanelView = useRef<SVGGElement>(null);
  const contents = useRef<SVGGElement>(null);

  const [getMidi] = useAtom(midi);
  const [getTrack] = useAtom(track);
  const [getDrift] = useAtom(drift);
  const [getDriftCurve] = useAtom(driftCurve);
  const [getPitchGuides] = useAtom(pitchGuides);
  const [getBeatGuides] = useAtom(beatGuides);
  const [getHumanized] = useAtom(humanized);

  useEffect(() => {
    /** padding around zoom fit and extent */
    const padding = noteHeight * 10;

    /** create zoom handler */
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on("zoom", (event) => {
        d3.select(topPanelView.current).attr("transform", event.transform);
        d3.select(bottomPanelView.current).attr(
          "transform",
          `translate(${event.transform.x}, 1) scale(${event.transform.k}, 1)`
        );
      })
      /** limit translate */
      .translateExtent([
        [0 - padding, getBeatGuides[0].y1 - padding],
        [getPitchGuides[0].width + padding, getBeatGuides[0].y2 + padding],
      ])
      /** limit scale */
      .scaleExtent([0.05, 20]);

    /** fit to contents */
    const fit = () => {
      if (
        !topPanel.ref.current ||
        !topPanel.width ||
        !topPanel.height ||
        !topPanelView.current
      )
        return;

      /** get contents of top panel view */
      const bbox = topPanelView.current.getBBox();
      const { x, y, width, height } = bbox;

      /** determine scale */
      const scaleX = width / (topPanel.width - padding);
      const scaleY = height / (topPanel.height - padding);
      const scale = 1 / Math.max(scaleX, scaleY);

      /** determine translate */
      const translateX = topPanel.width / 2 - scale * (x + width / 2);
      const translateY = topPanel.height / 2 - scale * (y + height / 2);

      d3.select(topPanel.ref.current).call(
        zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(scale)
      );
    };

    /** fit on render */
    fit();

    /** attach handlers to element */
    if (topPanel.ref.current)
      d3.select(topPanel.ref.current).call(zoom).on("dblclick.zoom", fit);
  }, [
    getMidi,
    getBeatGuides,
    getPitchGuides,
    topPanel.ref,
    topPanel.height,
    topPanel.width,
  ]);

  /** make svg path from drift curve */
  const driftPath = useMemo(
    () =>
      [0]
        .concat(getDriftCurve)
        .concat(0)
        .map((value, index) =>
          [index === 0 ? "M" : "L", index, -(value * 20).toFixed(1)].join(" ")
        )
        .join(" "),
    [getDriftCurve]
  );

  /** get notes */
  const originalNotes = getMidi ? getMidi.tracks[getTrack].notes : [];
  const humanizedNotes = getHumanized
    ? getHumanized.tracks[getTrack].notes
    : [];

  return (
    <div className={classes.pianoRoll}>
      <svg
        ref={topPanel.ref}
        viewBox={[0, 0, topPanel.width || 0, topPanel.height || 0].join(" ")}
        preserveAspectRatio="none"
        className={classes.topPanel}
      >
        <g ref={topPanelView}>
          {/* horizontal pitch guides */}
          <g>
            {getPitchGuides.map((pitch, index) => (
              <rect
                key={index}
                x={0}
                y={pitch.y}
                width={pitch.width}
                height={pitch.height}
                className={
                  pitch.black ? classes.pitchBlack : classes.pitchWhite
                }
              />
            ))}
          </g>

          {/* vertical beat guides */}
          <g>
            {getBeatGuides.map((beat, index) => (
              <line
                key={index}
                x1={beat.x}
                x2={beat.x}
                y1={beat.y1}
                y2={beat.y2}
                className={
                  beat.type === "major"
                    ? classes.beatMajor
                    : beat.type === "minor"
                    ? classes.beatMinor
                    : classes.beatGuidesub
                }
              />
            ))}
          </g>

          {/* border */}
          <rect
            x={0}
            y={getBeatGuides[0].y1}
            width={getPitchGuides[0].width}
            height={getBeatGuides[0].y2 - getBeatGuides[0].y1}
            className={classes.border}
          />

          {/* humanized notes */}
          <g className={classes.humanizedNotes}>
            {humanizedNotes.map((note, index) => (
              <rect
                key={index}
                x={note.ticks}
                y={(127 - note.midi) * noteHeight}
                width={note.durationTicks}
                height={noteHeight}
              />
            ))}
          </g>

          {/* original notes */}
          <g className={classes.originalNotes}>
            {originalNotes.map((note, index) => (
              <rect
                key={index}
                x={note.ticks}
                y={(127 - note.midi) * noteHeight}
                width={note.durationTicks}
                height={noteHeight}
              />
            ))}
          </g>
        </g>
      </svg>

      <svg
        ref={bottomPanel.ref}
        viewBox={[0, 0, bottomPanel.width || 0, bottomPanel.height || 0].join(
          " "
        )}
        className={classes.bottomPanel}
      >
        <g ref={bottomPanelView}>
          {/* vertical beat guides */}
          <g>
            {getBeatGuides.map((beat, index) => (
              <line
                key={index}
                x1={beat.x}
                x2={beat.x}
                y1={0}
                y2={bottomPanel.height}
                className={
                  beat.type === "major"
                    ? classes.beatMajor
                    : beat.type === "minor"
                    ? classes.beatMinor
                    : classes.beatGuidesub
                }
              />
            ))}
          </g>

          {/* border */}
          <rect
            x={0}
            y={0}
            width={getMidi?.durationTicks || 0}
            height={bottomPanel.height}
            className={classes.border}
          />

          {/* humanized velocities */}
          <g ref={contents} className={classes.velocities}>
            {humanizedNotes.map((note, index) => (
              <line
                key={index}
                x1={note.ticks}
                x2={note.ticks}
                y1={(1 - note.velocity) * bottomPanel.height}
                y2={bottomPanel.height}
              />
            ))}
          </g>

          {/* drift shape */}
          <path
            d={driftPath}
            transform={`translate(0, ${bottomPanel.height / 2})`}
            className={classes.drift}
            opacity={getDrift.amount / (getDrift.amount + 5)}
          />
        </g>
      </svg>
    </div>
  );
};

export default PianoRoll;
