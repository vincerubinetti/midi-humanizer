import { useLayoutEffect, useRef } from "react";
import { useElementSize } from "@reactuses/core/useElementSize";
import * as d3 from "d3";
import { useAtomValue } from "jotai";
import { range } from "lodash";
import Tooltip from "@/components/Tooltip";
import {
  beatGuidesAtom,
  beatRangeAtom,
  driftCurveAtom,
  humanizedAtom,
  midiAtom,
  pitchGuidesAtom,
  pitchRangeAtom,
  ppqAtom,
  trackIndexAtom,
} from "@/state";
import { getTheme } from "@/util/dom";
import { useTransform } from "@/util/hooks";
import { round } from "@/util/math";

export default function PianoRoll() {
  /** elements */
  const container = useRef<HTMLDivElement>(null);
  const topPanel = useRef<HTMLCanvasElement>(null);
  const topPanelCtx = useRef<CanvasRenderingContext2D>(null);
  const bottomPanel = useRef<HTMLCanvasElement>(null);
  const bottomPanelCtx = useRef<CanvasRenderingContext2D>(null);

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
  const driftCurve = useAtomValue(driftCurveAtom);
  const pitchGuides = useAtomValue(pitchGuidesAtom);
  const beatGuides = useAtomValue(beatGuidesAtom);
  const pitchRange = useAtomValue(pitchRangeAtom);
  const beatRange = useAtomValue(beatRangeAtom);
  const humanized = useAtomValue(humanizedAtom);
  const ppq = useAtomValue(ppqAtom);

  /** bounds of notes */
  const left = round(beatRange.min, ppq, "floor");
  const right = round(beatRange.max, ppq, "ceil");
  const bottom = pitchRange.min - 3;
  const top = pitchRange.max + 2;

  /** bounds of entire piano roll */
  const width = pitchGuides[0]?.width || 0;
  const height = beatGuides[0]?.height || 0;

  /** untransformed scales */
  const timeBaseScale = d3
    .scaleLinear()
    .domain([left, right])
    .range([0, topPanelWidth]);
  const pitchBaseScale = d3
    .scaleLinear()
    .domain([bottom, top])
    .range([topPanelHeight, 0]);
  const velocityScale = d3
    .scaleLinear()
    .domain([127, 0])
    .range([0, bottomPanelHeight]);
  const driftScale = d3
    .scaleLinear()
    .domain([-ppq / 4, ppq / 4])
    .range([0, bottomPanelHeight]);

  /** pan/zoom control */
  const [transform] = useTransform(container, {
    left: timeBaseScale(0),
    right: timeBaseScale(width),
    bottom: pitchBaseScale(0),
    top: pitchBaseScale(height),
  });

  /** transformed scales */
  const timeScale = d3.zoomIdentity
    .translate(transform.translate.x, 0)
    .scale(transform.scale.x)
    .rescaleX(timeBaseScale);
  const pitchScale = d3.zoomIdentity
    .translate(0, transform.translate.y)
    .scale(transform.scale.y)
    .rescaleY(pitchBaseScale);

  /** get notes */
  const originalNotes = midi ? midi.tracks[trackIndex]?.notes || [] : [];
  const humanizedNotes = humanized
    ? humanized.tracks[trackIndex]?.notes || []
    : [];

  /** get theme colors */
  const theme = getTheme();
  const accent = theme["--color-accent"] || "";
  const offWhite = theme["--color-off-white"] || "";
  const white = theme["--color-white"] || "";
  const gray = theme["--color-gray"] || "";
  const black = theme["--color-black"] || "";

  /** reset canvas */
  useLayoutEffect(() => {
    const scale = 2;
    if (topPanel.current) {
      topPanel.current.width = topPanelWidth * scale;
      topPanel.current.height = topPanelHeight * scale;
      topPanelCtx.current = topPanel.current.getContext("2d");
      topPanelCtx.current?.scale(scale, scale);
    }
    if (bottomPanel.current) {
      bottomPanel.current.width = bottomPanelWidth * scale;
      bottomPanel.current.height = bottomPanelHeight * scale;
      bottomPanelCtx.current = bottomPanel.current.getContext("2d");
      bottomPanelCtx.current?.scale(scale, scale);
    }
  }, [topPanelWidth, topPanelHeight, bottomPanelWidth, bottomPanelHeight]);

  /** draw utils */
  const rect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string,
    stroke?: string,
    thickness = 1,
  ) => {
    if (x + width < 0 || x > ctx.canvas.width) return;
    if (y + height < 0 || y > ctx.canvas.height) return;
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, width, height);
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = thickness;
      ctx.strokeRect(x, y, width, height);
    }
  };
  const line = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke: string,
    thickness = 1,
  ) => {
    if (x1 > x2) [x1, x2] = [x2, x1];
    if (y1 > y2) [y1, y2] = [y2, y1];
    if (x2 < 0 || x1 > ctx.canvas.width) return;
    if (y2 < 0 || y1 > ctx.canvas.height) return;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  /** draw */
  useLayoutEffect(() => {
    /** common values */
    const timeLeft = timeScale(0);
    const timeRight = timeScale(width);
    const pitchBottom = pitchScale(height);
    const pitchUnit = pitchScale(0) - pitchScale(1);
    const pitchTop = pitchScale(0);
    const velocityBottom = velocityScale(0);
    const velocityTop = velocityScale(127);

    if (topPanelCtx.current) {
      const ctx = topPanelCtx.current;

      /** reset */
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      /* horizontal pitch guides */
      for (const pitch of pitchGuides) {
        rect(
          ctx,
          timeLeft,
          pitchScale(pitch.top),
          timeScale(pitch.width) - timeLeft,
          pitchUnit,
          pitch.black ? offWhite : white,
        );
      }

      /* vertical beat guides */
      for (const beat of beatGuides) {
        const x = timeScale(beat.left);
        line(
          ctx,
          x,
          pitchBottom,
          x,
          pitchTop,
          gray,
          beat.type === "major" ? 1 : beat.type === "minor" ? 0.5 : 0.25,
        );
      }

      /* border */
      rect(
        ctx,
        timeLeft,
        pitchBottom,
        timeRight - timeLeft,
        pitchTop - pitchBottom,
        "",
        black,
      );

      /* original notes */
      for (const note of originalNotes)
        rect(
          ctx,
          timeScale(note.ticks),
          pitchScale(note.midi),
          timeScale(note.durationTicks) - timeLeft,
          pitchUnit,
          "",
          gray,
        );

      /* humanized notes */
      ctx.globalAlpha = 0.75;
      for (const note of humanizedNotes)
        rect(
          ctx,
          timeScale(note.ticks),
          pitchScale(note.midi),
          timeScale(note.durationTicks) - timeLeft,
          pitchUnit,
          accent,
          black,
        );
      ctx.globalAlpha = 1;
    }

    if (bottomPanelCtx.current) {
      const ctx = bottomPanelCtx.current;

      /** reset */
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      /* vertical beat guides */
      for (const beat of beatGuides) {
        const x = timeScale(beat.left);
        line(
          ctx,
          x,
          velocityBottom,
          x,
          velocityTop,
          gray,
          beat.type === "major" ? 1 : beat.type === "minor" ? 0.5 : 0.25,
        );
      }

      /* border */
      rect(
        ctx,
        timeLeft,
        velocityBottom,
        timeRight - timeLeft,
        velocityTop - velocityBottom,
        "",
        black,
      );

      /* humanized velocities */
      for (const note of humanizedNotes) {
        const x = timeScale(note.ticks);
        line(
          ctx,
          x,
          velocityBottom,
          x,
          velocityScale(note.velocity * 127),
          accent,
          3,
        );
      }

      /* drift shape */
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.5;
      const points = range(bottomPanelWidth + 1)
        .map((x) => ({ x, tick: timeScale.invert(x) }))
        .filter(({ tick }) => tick >= 0 && tick <= width)
        .map(({ x, tick }) => ({ x, y: driftScale(driftCurve(tick)) }));
      points.unshift({ x: timeLeft, y: driftScale(0) });
      points.push({ x: timeRight, y: driftScale(0) });
      ctx.beginPath();
      let first = true;
      for (const { x, y } of points) {
        ctx[first ? "moveTo" : "lineTo"](x, y);
        first = false;
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

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
        <canvas ref={topPanel} className="h-3/4 w-full" />
        <canvas ref={bottomPanel} className="h-1/4 w-full" />
      </div>
    </Tooltip>
  );
}
