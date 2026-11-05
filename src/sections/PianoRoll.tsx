import { useLayoutEffect, useRef } from "react";
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
  const track = useAtomValue(trackAtom);
  const driftCurve = useAtomValue(driftCurveAtom);
  const pitchGuides = useAtomValue(pitchGuidesAtom);
  const beatGuides = useAtomValue(beatGuidesAtom);
  const pitchRange = useAtomValue(pitchRangeAtom);
  const beatRange = useAtomValue(beatRangeAtom);
  const humanized = useAtomValue(humanizedAtom);

  /** dimensions of piano roll in canvas coordinates */
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

  /** make path from drift curve */
  const driftPath = [0]
    .concat(driftCurve)
    .concat(0)
    .map(
      (value, index) =>
        [
          xScale(index),
          (bottomPanelHeight / 2) * (1 - (track.drift.amount * value) / 10),
        ] as const,
    );

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

  /** draw */
  useLayoutEffect(() => {
    /** common values */
    const x0 = xScale(0);
    const y0 = yScale(0);
    const y1 = yScale(1);
    const xWidth = xScale(width);
    const yHeight = yScale(height);

    if (topPanelCtx.current) {
      const ctx = topPanelCtx.current;

      /** reset */
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      /* horizontal pitch guides */
      for (const pitch of pitchGuides) {
        ctx.fillStyle = pitch.black ? offWhite : white;
        ctx.fillRect(x0, yScale(pitch.top), xScale(pitch.width) - x0, y1 - y0);
      }

      /* vertical beat guides */
      ctx.strokeStyle = gray;
      for (const beat of beatGuides) {
        const x = xScale(beat.left);
        if (x < 0 || x > topPanelWidth) continue;
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, yHeight);
        ctx.lineWidth =
          beat.type === "major" ? 1 : beat.type === "minor" ? 0.5 : 0.25;
        ctx.stroke();
      }

      /* border */
      ctx.strokeStyle = black;
      ctx.lineWidth = 1;
      ctx.strokeRect(x0, y0, xWidth - x0, yHeight - y0);

      /* original notes */
      ctx.strokeStyle = gray;
      ctx.lineWidth = 1;
      for (const note of originalNotes) {
        const x = xScale(note.ticks);
        const y = yScale(127 - note.midi);
        const width = xScale(note.durationTicks) - x0;
        const height = y1 - y0;
        if (x + width < 0 || x > topPanelWidth) continue;
        if (y + height < 0 || y > topPanelHeight) continue;
        ctx.strokeRect(x, y, width, height);
      }

      /* humanized notes */
      ctx.fillStyle = accent;
      ctx.strokeStyle = black;
      ctx.lineWidth = 1;
      for (const note of humanizedNotes) {
        const x = xScale(note.ticks);
        const y = yScale(127 - note.midi);
        const width = xScale(note.durationTicks) - x0;
        const height = y1 - y0;
        if (x + width < 0 || x > topPanelWidth) continue;
        if (y + height < 0 || y > topPanelHeight) continue;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
      }
    }

    if (bottomPanelCtx.current) {
      const ctx = bottomPanelCtx.current;

      /** reset */
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      /* vertical beat guides */
      ctx.strokeStyle = gray;
      for (const beat of beatGuides) {
        const x = xScale(beat.left);
        if (x < 0 || x > topPanelWidth) continue;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, bottomPanelHeight);
        ctx.lineWidth =
          beat.type === "major" ? 1 : beat.type === "minor" ? 0.5 : 0.25;
        ctx.stroke();
      }

      /* border */
      ctx.strokeStyle = black;
      ctx.lineWidth = 1;
      ctx.strokeRect(
        x0,
        0,
        xScale(midi?.durationTicks || 0) - x0,
        bottomPanelHeight,
      );

      /* humanized velocities */
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      for (const note of humanizedNotes) {
        const x = xScale(note.ticks);
        if (x < 0 || x > topPanelWidth) continue;
        ctx.beginPath();
        ctx.moveTo(x, (1 - note.velocity) * bottomPanelHeight);
        ctx.lineTo(x, bottomPanelHeight);
        ctx.stroke();
      }

      /* drift shape */
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      for (const [index, [x, y]] of driftPath.entries())
        ctx[index ? "lineTo" : "moveTo"](x, y);
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
