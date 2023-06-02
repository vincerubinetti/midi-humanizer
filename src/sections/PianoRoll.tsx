import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import useResizeObserver from "use-resize-observer";
import { thickness, useState } from "@/global/state";
import { clamp, random } from "@/util/math";
import classes from "./PianoRoll.module.css";

const PianoRoll = () => {
  const svg = useRef<SVGSVGElement>(null);
  const view = useRef<SVGGElement>(null);
  const contents = useRef<SVGGElement>(null);
  const panel = useRef<SVGGElement>(null);

  const { width = 0, height = 0 } = useResizeObserver<SVGSVGElement>({
    ref: svg,
  });

  const midi = useState((state) => state.midi);

  const start = useState((state) => state.start);
  const drift = useState((state) => state.drift);
  const duration = useState((state) => state.duration);
  const velocity = useState((state) => state.velocity);
  const grid = useState((state) => state.options.grid);

  useEffect(() => {
    if (svg.current && view.current && contents.current && panel.current)
      runD3(
        svg.current,
        view.current,
        contents.current,
        panel.current,
        width,
        height
      );
  }, [width, height, midi]);

  const pitches = useMemo(
    () =>
      Array(128)
        .fill({})
        .map((_, pitch) => ({
          x: 0,
          y: -pitch * thickness - thickness,
          width: midi ? midi.durationTicks : 96 * 16,
          height: thickness,
          black: !![1, 3, 6, 8, 10].includes(pitch % 12),
        })),
    [midi]
  );

  const beats = useMemo(() => {
    const beats = [];

    const ppq = midi?.header.ppq || 96;
    const durationTicks = midi?.durationTicks || 0;

    const subs = Array(grid)
      .fill(0)
      .map((_, index) => Math.floor((index / grid) * ppq));

    for (let tick = 0; tick < durationTicks; tick += ppq) {
      for (const sub of subs) {
        const measure = midi?.header.ticksToMeasures(tick + sub) || 0;
        beats.push({
          x: tick + sub,
          y1: -128 * thickness,
          y2: 0,
          type: measure % 1 === 0 ? "major" : sub === 0 ? "minor" : "sub",
        });
      }
    }

    return beats;
  }, [midi, grid]);

  const driftMap = useMemo(() => {
    const durationTicks = midi?.durationTicks || 0;
    const ticks = [];
    const values = [];
    for (let tick = drift.step; tick < durationTicks; tick += drift.step) {
      ticks.push(tick);
      values.push(
        random("drift" + tick / drift.step + drift.seed) * drift.amount * 2
      );
    }

    const scale = d3
      .scaleLinear()
      .domain(ticks)
      .range(values)
      .interpolate((a, b) => (t) => {
        const y = 0.5 - Math.cos(Math.PI * t) / 2;
        return a + (b - a) * y;
      });

    return Array(durationTicks)
      .fill({})
      .map((_, index) => scale(index));
  }, [midi, drift]);

  const driftPath = useMemo(
    () =>
      [0]
        .concat(driftMap)
        .concat(0)
        .map((value, index) =>
          [index === 0 ? "M" : "L", index, -(value * 2).toFixed(1)].join(" ")
        )
        .join(" "),
    [driftMap]
  );

  const originalNotes = useMemo(
    () => (midi ? midi.tracks[0].notes : []),
    [midi]
  );

  const humanizedNotes = useMemo(() => {
    if (!midi) return [];

    return originalNotes
      .map((note, index) => {
        let newTicks =
          note.ticks +
          random("start" + index + start.seed) * start.randomness +
          start.offset +
          (driftMap[note.ticks] || 0);
        let newDuration =
          (note.durationTicks +
            random("duration" + index + duration.seed) * duration.randomness +
            duration.offset) *
          duration.scale;
        let newVelocity =
          (note.velocity +
            random("velocity" + index + velocity.seed) * velocity.randomness +
            velocity.offset) *
          velocity.scale;

        if (newTicks < 0) newTicks = 0;
        if (newTicks > midi.durationTicks) newTicks = midi.durationTicks;
        if (newDuration < 0) newDuration = 0;
        if (newDuration + newTicks > midi.durationTicks)
          newDuration = Math.max(0, midi.durationTicks - newTicks);
        newVelocity = clamp(newVelocity, 0, 1);

        return {
          ...note,
          ticks: Math.round(newTicks),
          durationTicks: Math.round(newDuration),
          velocity: newVelocity,
        };
      })
      .sort((a, b) => a.ticks - b.ticks)
      .map((note, _, array) => {
        for (const otherNote of array)
          if (
            note.midi === otherNote.midi &&
            note.ticks < otherNote.ticks &&
            note.ticks + note.durationTicks >= otherNote.ticks
          )
            note.durationTicks = otherNote.ticks - note.ticks;

        return {
          ...note,
          time: midi.header.ticksToSeconds(note.ticks),
          duration: midi.header.ticksToSeconds(note.durationTicks),
        };
      });
  }, [midi, originalNotes, start, driftMap, duration, velocity]);

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

          <g ref={panel}>
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

const runD3 = (
  svg: SVGSVGElement,
  view: SVGGElement,
  contents: SVGGElement,
  panel: SVGGElement,
  svgWidth: number,
  svgHeight: number
) => {
  const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
    d3.select<SVGGElement, unknown>(view).attr("transform", event.transform);
    d3.select<SVGGElement, unknown>(panel).attr(
      "transform",
      `translate(0, ${
        (-event.transform.y + svgHeight) / event.transform.k
      }) scale(1, ${1 / event.transform.k})`
    );
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
