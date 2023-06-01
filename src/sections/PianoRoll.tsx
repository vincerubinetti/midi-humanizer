import { useEffect, useRef } from "react";
import * as d3 from "d3";
import useResizeObserver from "use-resize-observer";
import { thickness, useState } from "@/global/state";
import { random } from "@/util/math";
import classes from "./PianoRoll.module.css";

const PianoRoll = () => {
  const svg = useRef<SVGSVGElement>(null);
  const view = useRef<SVGGElement>(null);
  const contents = useRef<SVGGElement>(null);

  const { width = 0, height = 0 } = useResizeObserver<SVGSVGElement>({
    ref: svg,
  });

  const midi = useState((state) => state.midi);
  const pitches = useState((state) => state.pitches);
  const beats = useState((state) => state.beats);

  const start = useState((state) => state.start);
  const duration = useState((state) => state.duration);

  const originalNotes = midi ? midi.tracks[0].notes : [];

  useEffect(() => {
    if (svg.current && view.current && contents.current)
      runD3(svg.current, view.current, contents.current, width, height);
  }, [width, height, midi]);

  const humanizedNotes = midi
    ? originalNotes.map((note, index) => {
        let ticks =
          note.ticks +
          random("ticks" + index + start.seed) * start.randomness +
          start.offset;
        let durationTicks =
          (note.durationTicks +
            random("durationTicks" + index + duration.seed) * duration.randomness +
            duration.offset) *
          duration.scale;

        if (ticks < 0) ticks = 0;
        if (ticks > midi.durationTicks) ticks = midi.durationTicks;
        if (durationTicks < 0) durationTicks = 0;
        if (durationTicks + ticks > midi.durationTicks)
          durationTicks = Math.max(0, midi.durationTicks - ticks);

        ticks = Math.round(ticks);
        durationTicks = Math.round(durationTicks);

        return {
          ...note,
          ticks,
          durationTicks,
        };
      })
    : [];

  return (
    <>
      <svg
        ref={svg}
        viewBox={[0, 0, width, height].join(" ")}
        className={classes.pianoRoll}
        preserveAspectRatio="none"
      >
        <g ref={view}>
          <g className={classes.pitches}>
            {pitches.map((pitch, index) => (
              <rect
                key={index}
                x={pitch.x}
                y={pitch.y}
                width={pitch.width}
                height={pitch.height}
                fill={pitch.black ? "#cfd8dc" : "#eceff1"}
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
                stroke={beat.major ? "#263238" : "#90a4ae"}
              />
            ))}
          </g>

          <g>
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
          </g>
        </g>
      </svg>
    </>
  );
};

export default PianoRoll;

const runD3 = (
  svg: SVGSVGElement,
  view: SVGGElement,
  contents: SVGGElement,
  svgWidth: number,
  svgHeight: number
) => {
  const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
    d3.select<SVGGElement, unknown>(view).attr("transform", event.transform);
  });

  const fit = () => {
    const { x, y, width, height } = contents.getBBox();

    if (!svgWidth || !svgHeight || !width || !height) return;

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
