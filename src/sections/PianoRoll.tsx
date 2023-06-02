import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import useResizeObserver from "use-resize-observer";
import { Midi } from "@tonejs/midi";
import { thickness, useState } from "@/global/state";
import classes from "./PianoRoll.module.css";

const PianoRoll = () => {
  const svg = useRef<SVGSVGElement>(null);
  const view = useRef<SVGGElement>(null);
  const topPanel = useRef<SVGGElement>(null);
  const bottomPanel = useRef<SVGGElement>(null);
  const contents = useRef<SVGGElement>(null);

  const { width = 0, height = 0 } = useResizeObserver<SVGSVGElement>({
    ref: svg,
  });

  const midi = useState((state) => state.midi);

  const driftCurve = useState((state) => state.driftCurve);
  const pitches = useState((state) => state.pitches);
  const beats = useState((state) => state.beats);
  const humanizedNotes = useState((state) => state.humanizedNotes);

  useEffect(() => {
    if (
      svg.current &&
      view.current &&
      topPanel.current &&
      bottomPanel.current &&
      contents.current
    )
      runD3({
        midi,
        svg: svg.current,
        view: view.current,
        topPanel: topPanel.current,
        bottomPanel: bottomPanel.current,
        contents: contents.current,
        svgWidth: width,
        svgHeight: height,
      });
  }, [width, height, midi]);

  const driftPath = useMemo(
    () =>
      [0]
        .concat(driftCurve)
        .concat(0)
        .map((value, index) =>
          [index === 0 ? "M" : "L", index, -(value * 2).toFixed(1)].join(" ")
        )
        .join(" "),
    [driftCurve]
  );

  const originalNotes = useMemo(
    () => (midi ? midi.tracks[0].notes : []),
    [midi]
  );

  return (
    <>
      <svg
        ref={svg}
        viewBox={[0, 0, width, height].join(" ")}
        className={classes.pianoRoll}
        preserveAspectRatio="none"
      >
        <g ref={view}>
          <g ref={topPanel}>
            <g className={classes.pitches}>
              {pitches.map((pitch, index) => (
                <rect
                  key={index}
                  x={pitch.x}
                  y={pitch.y}
                  width={pitch.width}
                  height={pitch.height}
                  className={
                    pitch.black ? classes.pitchBlack : classes.pitchWhite
                  }
                />
              ))}
            </g>

            <g className={classes.beats}>
              {beats.map((beat, index) => (
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
                      : classes.beatSub
                  }
                />
              ))}
            </g>

            <g className={classes.humanizedNotes}>
              {humanizedNotes.map((note, index) => (
                <rect
                  key={index}
                  x={note.ticks}
                  y={-note.midi * thickness - thickness}
                  width={note.durationTicks}
                  height={thickness}
                />
              ))}
            </g>

            <g ref={contents} className={classes.originalNotes}>
              {originalNotes.map((note, index) => (
                <rect
                  key={index}
                  x={note.ticks}
                  y={-note.midi * thickness - thickness}
                  width={note.durationTicks}
                  height={thickness}
                />
              ))}
            </g>

            <rect
              x={0}
              y={-128 * thickness}
              width={midi?.durationTicks || 0}
              height={128 * thickness}
              className={classes.border}
            />
          </g>

          <g ref={bottomPanel}>
            <rect
              id="shape"
              x={0}
              y={-thickness * 15}
              width={pitches[0].width}
              height={thickness * 15}
              className={classes.velocityBg}
            />

            {beats.map((beat, index) => (
              <line
                key={index}
                x1={beat.x}
                x2={beat.x}
                y1={-thickness * 15}
                y2={thickness * 15}
                className={
                  beat.type === "major"
                    ? classes.beatMajor
                    : beat.type === "minor"
                    ? classes.beatMinor
                    : classes.beatSub
                }
              />
            ))}

            {humanizedNotes.map((note, index) => (
              <line
                key={index}
                x1={note.ticks}
                x2={note.ticks}
                y1={0}
                y2={-note.velocity * thickness * 15}
                className={classes.velocity}
              />
            ))}

            <path
              d={driftPath}
              transform={`translate(0, ${(-thickness * 15) / 2})`}
              className={classes.drift}
            />

            <rect
              x={0}
              y={-thickness * 15}
              width={pitches[0].width}
              height={thickness * 15}
              className={classes.border}
            />
          </g>
        </g>
      </svg>
    </>
  );
};

export default PianoRoll;

type D3 = {
  midi?: Midi;
  svg: SVGSVGElement;
  view: SVGGElement;
  contents: SVGGElement;
  topPanel: SVGGElement;
  bottomPanel: SVGGElement;
  svgWidth: number;
  svgHeight: number;
};

const runD3 = ({
  midi,
  svg,
  view,
  contents,
  topPanel,
  bottomPanel,
  svgWidth,
  svgHeight,
}: D3) => {
  const ppq = midi?.header.ppq || 96;
  const durationTicks = midi?.durationTicks || 96 * 4 * 4;

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .on("zoom", (event) => {
      d3.select<SVGGElement, unknown>(view).attr("transform", event.transform);

      const translateY = (-event.transform.y + svgHeight) / event.transform.k;
      const scaleY = 1 / event.transform.k;
      const transform = `translate(0, ${translateY}) scale(1, ${scaleY})`;
      d3.select<SVGGElement, unknown>(bottomPanel).attr("transform", transform);
    })
    .translateExtent([
      [-ppq * 8, -thickness * 128 - thickness * 32],
      [durationTicks + ppq * 8, thickness * 32],
    ])
    .scaleExtent([0.05, 20]);

  const fit = () => {
    if (!svgWidth || !svgHeight) return;

    let bbox = contents.getBBox();
    if (!bbox.width || !bbox.height) bbox = topPanel.getBBox();
    const { x, y, width, height } = bbox;

    const scale = 1 / Math.max(width / svgWidth, height / svgHeight);

    const midX = x + width / 2;
    const midY = y + height / 2;

    const translateX = svgWidth / 2 - scale * midX;
    const translateY = svgHeight / 2 - scale * midY;

    d3.select(svg).call(
      zoom.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(scale)
    );
  };

  fit();

  d3.select(svg).call(zoom).on("dblclick.zoom", fit);
};
