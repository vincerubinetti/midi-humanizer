import { useRef } from "react";
import { useElementSize } from "@reactuses/core/useElementSize";
import * as d3 from "d3";
import { useAtomValue } from "jotai";
import Tooltip from "@/components/Tooltip";
import {
  beatGuidesAtom,
  beatRangeAtom,
  driftCurveAtom,
  humanizedAtom,
  midiAtom,
  pitchGuidesAtom,
  pitchRangeAtom,
  trackAtom,
  trackIndexAtom,
} from "@/state";
import { useTransform } from "@/util/hooks";
import { round } from "@/util/math";

export default function PianoRoll() {
  /** elements */
  const container = useRef<HTMLDivElement>(null);
  const topPanel = useRef<SVGSVGElement>(null);
  const bottomPanel = useRef<SVGSVGElement>(null);

  /** sizes */
  let [topPanelWidth, topPanelHeight] = useElementSize(topPanel);
  let [bottomPanelWidth, bottomPanelHeight] = useElementSize(bottomPanel);
  topPanelWidth ||= 10;
  topPanelHeight ||= 10;
  bottomPanelWidth ||= 10;
  bottomPanelHeight ||= 10;

  /** global state */
  const midi = useAtomValue(midiAtom);
  const trackIndex = useAtomValue(trackIndexAtom);
  const track = useAtomValue(trackAtom);
  const driftCurve = useAtomValue(driftCurveAtom);
  const pitchGuides = useAtomValue(pitchGuidesAtom);
  const beatGuides = useAtomValue(beatGuidesAtom);
  const pitchRange = useAtomValue(pitchRangeAtom);
  const beatRange = useAtomValue(beatRangeAtom);
  const humanized = useAtomValue(humanizedAtom);

  /** dimensions of piano roll in svg coordinates */
  const width = pitchGuides[0]?.width || 0;
  const height = beatGuides[0]?.height || 0;
  const top = 127 - pitchRange.max - 2;
  const bottom = 127 - pitchRange.min + 3;
  const left = round(beatRange.min, midi?.header.ppq || 1, "floor");
  const right = round(beatRange.max, midi?.header.ppq || 1, "ceil");

  /** untransformed scales */
  const xBaseScale = d3
    .scaleLinear()
    .domain([left, right])
    .range([0, topPanelWidth]);
  const yBaseScale = d3
    .scaleLinear()
    .domain([top, bottom])
    .range([0, topPanelHeight]);

  /** pan/zoom control */
  const [transform] = useTransform(container, {
    left: xBaseScale(0),
    right: xBaseScale(width),
    top: yBaseScale(0),
    bottom: yBaseScale(height),
  });

  /** transformed scales */
  const xScale = d3.zoomIdentity
    .translate(transform.translate.x, 0)
    .scale(transform.scale.x)
    .rescaleX(xBaseScale);
  const yScale = d3.zoomIdentity
    .translate(0, transform.translate.y)
    .scale(transform.scale.y)
    .rescaleY(yBaseScale);

  /** make svg path from drift curve */
  const driftPath = [0]
    .concat(driftCurve)
    .concat(0)
    .map((value, index) =>
      [
        index === 0 ? "M" : "L",
        xScale(index),
        (bottomPanelHeight / 2) * (1 - (track.drift.amount * value) / 10),
      ].join(" "),
    )
    .join(" ");

  /** get notes */
  const originalNotes = midi ? midi.tracks[trackIndex]?.notes || [] : [];
  const humanizedNotes = humanized
    ? humanized.tracks[trackIndex]?.notes || []
    : [];

  return (
    <Tooltip
      content={
        <div className="grid grid-cols-[auto_auto] gap-x-4">
          <div>Move</div>
          <div>Click + drag</div>
          <div>Zoom</div>
          <div>Scroll + alt/opt</div>
          <div>Zoom horizontal</div>
          <div>Scroll + shift</div>
          <div>Zoom vertical</div>
          <div>Scroll + ctrl/cmd</div>
          <div>Reset</div>
          <div>Double click</div>
        </div>
      }
    >
      <div
        ref={container}
        className="flex h-80 w-full resize-y flex-col overflow-hidden rounded-md border border-light-gray bg-white"
      >
        <svg
          ref={topPanel}
          viewBox={[0, 0, topPanelWidth, topPanelHeight].join(" ")}
          preserveAspectRatio="none"
          className="h-3/4 w-full"
        >
          {/* horizontal pitch guides */}
          <g>
            {pitchGuides.map((pitch, index) => (
              <rect
                key={index}
                x={xScale(0)}
                y={yScale(pitch.top)}
                width={xScale(pitch.width) - xScale(0)}
                height={yScale(1) - yScale(0)}
                className={pitch.black ? "fill-off-white" : "fill-white"}
              />
            ))}
          </g>

          {/* vertical beat guides */}
          <g className="stroke-gray">
            {beatGuides.map((beat, index) => (
              <line
                key={index}
                x1={xScale(beat.left)}
                x2={xScale(beat.left)}
                y1={yScale(0)}
                y2={yScale(height)}
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
            x={xScale(0)}
            y={yScale(0)}
            width={xScale(width) - xScale(0)}
            height={yScale(height) - yScale(0)}
            className="fill-none stroke-black"
          />

          {/* original notes */}
          <g className="fill-none stroke-gray">
            {originalNotes.map((note, index) => (
              <rect
                key={index}
                x={xScale(note.ticks)}
                y={yScale(127 - note.midi)}
                width={xScale(note.durationTicks) - xScale(0)}
                height={yScale(1) - yScale(0)}
              />
            ))}
          </g>

          {/* humanized notes */}
          <g className="fill-accent stroke-black">
            {humanizedNotes.map((note, index) => (
              <rect
                key={index}
                x={xScale(note.ticks)}
                y={yScale(127 - note.midi)}
                width={xScale(note.durationTicks) - xScale(0)}
                height={yScale(1) - yScale(0)}
              />
            ))}
          </g>
        </svg>

        <svg
          ref={bottomPanel}
          viewBox={[0, 0, bottomPanelWidth, bottomPanelHeight].join(" ")}
          className="h-1/4 w-full"
        >
          <g>
            {/* vertical beat guides */}
            <g className="stroke-gray">
              {beatGuides.map((beat, index) => (
                <line
                  key={index}
                  x1={xScale(beat.left)}
                  x2={xScale(beat.left)}
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
              x={xScale(0)}
              y={0}
              width={xScale(midi?.durationTicks || 0) - xScale(0)}
              height={bottomPanelHeight}
              className="fill-none stroke-black"
            />

            {/* humanized velocities */}
            <g className="stroke-accent stroke-3">
              {humanizedNotes.map((note, index) => (
                <line
                  key={index}
                  x1={xScale(note.ticks)}
                  x2={xScale(note.ticks)}
                  y1={(1 - note.velocity) * bottomPanelHeight}
                  y2={bottomPanelHeight}
                />
              ))}
            </g>

            {/* drift shape */}
            <path d={driftPath} className="fill-accent" opacity={0.5} />
          </g>
        </svg>
      </div>
    </Tooltip>
  );
}
