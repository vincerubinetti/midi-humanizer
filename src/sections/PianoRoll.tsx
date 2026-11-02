import { useEffect, useMemo, useRef } from "react";
import { useElementSize } from "@reactuses/core/useElementSize";
import * as d3 from "d3";
import { useAtom } from "jotai";
import Tooltip from "@/components/Tooltip";
import {
  beatGuides,
  drift,
  driftCurve,
  humanized,
  midi,
  pitchGuides,
  track,
} from "@/state";

export const noteHeight = 10;

export default function PianoRoll() {
  /** elements */
  const topPanel = useRef<SVGSVGElement>(null);
  const bottomPanel = useRef<SVGSVGElement>(null);
  const topPanelView = useRef<SVGGElement>(null);
  const bottomPanelView = useRef<SVGGElement>(null);
  const contents = useRef<SVGGElement>(null);

  /** sizes */
  let [topPanelWidth, topPanelHeight] = useElementSize(topPanel);
  let [bottomPanelWidth, bottomPanelHeight] = useElementSize(bottomPanel);
  topPanelWidth ||= 10;
  topPanelHeight ||= 10;
  bottomPanelWidth ||= 10;
  bottomPanelHeight ||= 10;

  /** state */
  const [getMidi] = useAtom(midi);
  const [getTrack] = useAtom(track);
  const [getDrift] = useAtom(drift);
  const [getDriftCurve] = useAtom(driftCurve);
  const [getPitchGuides] = useAtom(pitchGuides);
  const [getBeatGuides] = useAtom(beatGuides);
  const [getHumanized] = useAtom(humanized);

  /** dimensions of piano roll in svg coordinates */
  const beatY1 = getBeatGuides[0]?.y1 || 0;
  const beatY2 = getBeatGuides[0]?.y2 || 0;
  const pitchWidth = getPitchGuides[0]?.width || 0;

  useEffect(() => {
    /** padding around pan extent */
    const padding = noteHeight * 20;

    /** create zoom handler */
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on("zoom", (event) => {
        d3.select(topPanelView.current).attr("transform", event.transform);
        d3.select(bottomPanelView.current).attr(
          "transform",
          `translate(${event.transform.x}, 1) scale(${event.transform.k}, 1)`,
        );
      })
      /** limit translate */
      .translateExtent([
        [0 - padding, beatY1 - padding],
        [pitchWidth + padding, beatY2 + padding],
      ])
      /** limit scale */
      .scaleExtent([0.05, 20])
      /** require modifier key to scroll with mouse wheel */
      .filter((event) => {
        if (event.type === "wheel" && !event.altKey) return false;
        return true;
      });

    /** fit to contents */
    const fit = () => {
      if (
        !topPanel.current ||
        !topPanelWidth ||
        !topPanelHeight ||
        !topPanelView.current
      )
        return;

      /** padding around fit */
      const padding = noteHeight * 0;

      /** get contents of top panel view */
      const bbox = topPanelView.current.getBBox();
      const { x, y, width, height } = bbox;

      /** determine scale */
      const scaleX = width / (topPanelWidth - padding);
      const scaleY = height / (topPanelHeight - padding);
      const scale = 1 / Math.max(scaleX, scaleY);

      /** determine translate */
      const translateX = topPanelWidth / 2 - scale * (x + width / 2);
      const translateY = topPanelHeight / 2 - scale * (y + height / 2);

      /** apply transform */
      d3.select(topPanel.current).call(
        zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(scale),
      );
    };

    /** fit on render */
    fit();

    /** attach handlers to element */
    if (topPanel.current)
      d3.select(topPanel.current).call(zoom).on("dblclick.zoom", fit);
  }, [
    getMidi,
    beatY1,
    beatY2,
    pitchWidth,
    topPanel,
    topPanelWidth,
    topPanelHeight,
  ]);

  /** make svg path from drift curve */
  const driftPath = useMemo(
    () =>
      [0]
        .concat(getDriftCurve)
        .concat(0)
        .map((value, index) =>
          [index === 0 ? "M" : "L", index, -(value * 40).toFixed(1)].join(" "),
        )
        .join(" "),
    [getDriftCurve],
  );

  /** get notes */
  const originalNotes = getMidi ? getMidi.tracks[getTrack]?.notes || [] : [];
  const humanizedNotes = getHumanized
    ? getHumanized.tracks[getTrack]?.notes || []
    : [];

  return (
    <Tooltip content="Piano roll. Click and drag to pan. Scroll + alt/option to zoom. Double click to fit.">
      <div className="flex h-80 w-full resize-y flex-col overflow-hidden rounded-md border border-light-gray bg-white">
        <svg
          ref={topPanel}
          viewBox={[0, 0, topPanelWidth, topPanelHeight].join(" ")}
          preserveAspectRatio="none"
          className="h-3/4 w-full"
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
                  className={pitch.black ? "fill-off-white" : "fill-white"}
                />
              ))}
            </g>

            {/* vertical beat guides */}
            <g className="stroke-gray">
              {getBeatGuides.map((beat, index) => (
                <line
                  key={index}
                  x1={beat.x}
                  x2={beat.x}
                  y1={beat.y1}
                  y2={beat.y2}
                  className={
                    beat.type === "major"
                      ? "stroke-1"
                      : beat.type === "minor"
                        ? "stroke-[0.5]"
                        : "stroke-[0.25]"
                  }
                />
              ))}
            </g>

            {/* border */}
            <rect
              x={0}
              y={beatY1}
              width={pitchWidth}
              height={beatY2 - beatY1}
              className="fill-none stroke-black"
            />

            {/* original notes */}
            <g className="fill-none stroke-gray">
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

            {/* humanized notes */}
            <g className="fill-accent stroke-black">
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
          </g>
        </svg>

        <svg
          ref={bottomPanel}
          viewBox={[0, 0, bottomPanelWidth, bottomPanelHeight].join(" ")}
          className="h-1/4 w-full"
        >
          <g ref={bottomPanelView}>
            {/* vertical beat guides */}
            <g className="stroke-gray">
              {getBeatGuides.map((beat, index) => (
                <line
                  key={index}
                  x1={beat.x}
                  x2={beat.x}
                  y1={0}
                  y2={bottomPanelHeight}
                  className={
                    beat.type === "major"
                      ? "stroke-1"
                      : beat.type === "minor"
                        ? "stroke-[0.5]"
                        : "stroke-[0.25]"
                  }
                />
              ))}
            </g>

            {/* border */}
            <rect
              x={0}
              y={0}
              width={getMidi?.durationTicks || 0}
              height={(bottomPanelHeight || 1) - 1}
              className="fill-none stroke-black"
            />

            {/* humanized velocities */}
            <g ref={contents} className="stroke-accent stroke-3">
              {humanizedNotes.map((note, index) => (
                <line
                  key={index}
                  x1={note.ticks}
                  x2={note.ticks}
                  y1={(1 - note.velocity) * bottomPanelHeight}
                  y2={bottomPanelHeight}
                />
              ))}
            </g>

            {/* drift shape */}
            <path
              d={driftPath}
              transform={`translate(0, ${bottomPanelHeight / 2}) scale(1, ${
                getDrift.amount / (Math.abs(getDrift.amount) + 5)
              })`}
              className="fill-accent"
              opacity={0.5}
            />
          </g>
        </svg>
      </div>
    </Tooltip>
  );
}
