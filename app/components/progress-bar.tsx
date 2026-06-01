"use client";

import clsx from "clsx";

type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
  className?: string;
  /** Accessible label when `label` is omitted. Defaults to "Progress". */
  "aria-label"?: string;
};

export function ProgressBar({
  value,
  max,
  label,
  className,
  "aria-label": ariaLabel = "Progress",
}: ProgressBarProps) {
  const safeMax = Math.max(max, 1);
  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const percent = (clampedValue / safeMax) * 100;

  return (
    <div className={clsx("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3 text-sm/6">
          <span className="font-medium text-zinc-950 dark:text-white">{label}</span>
          <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
            {clampedValue} / {max}
          </span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        className="h-2 overflow-hidden rounded-full bg-zinc-950/10 dark:bg-white/10"
      >
        <div
          className="h-full rounded-full bg-indigo-500 transition-[width] duration-500 ease-out dark:bg-indigo-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export type SegmentedProgressSegment = {
  id: string;
  complete: boolean;
  /** Shown to screen readers for each segment. */
  label?: string;
};

type SegmentedProgressBarProps = {
  segments: SegmentedProgressSegment[];
  className?: string;
  /** Summary line above the bar, e.g. "2 of 5 cards seen". */
  summary?: string;
  "aria-label"?: string;
};

export function SegmentedProgressBar({
  segments,
  className,
  summary,
  "aria-label": ariaLabel = "Study progress",
}: SegmentedProgressBarProps) {
  const completeCount = segments.filter((segment) => segment.complete).length;
  const total = segments.length;

  return (
    <div className={clsx("space-y-2", className)}>
      {summary ? (
        <p className="text-sm/6 font-medium text-zinc-600 dark:text-zinc-300">{summary}</p>
      ) : null}
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completeCount}
        className="flex gap-1.5"
      >
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            aria-hidden="true"
            title={segment.label ?? `Card ${index + 1}`}
            className={clsx(
              "h-2 min-w-0 flex-1 rounded-full transition-colors duration-500 ease-out",
              segment.complete
                ? "bg-indigo-500 dark:bg-indigo-400"
                : "bg-zinc-950/10 dark:bg-white/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}
