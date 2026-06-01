"use client";

import clsx from "clsx";
import type { ReactNode, SVGProps } from "react";

type FlipCardProps = {
  flipped: boolean;
  onFlip?: () => void;
  front: ReactNode;
  back: ReactNode;
  className?: string;
  /** Minimum height of the card face in pixels. */
  minHeight?: number;
};

const faceStyles = [
  "absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-zinc-950/10 bg-white shadow-sm ring-1 ring-zinc-950/5",
  "dark:border-white/10 dark:bg-zinc-900 dark:ring-white/10",
  "[backface-visibility:hidden]",
];

export function FlipCard({
  flipped,
  onFlip,
  front,
  back,
  className,
  minHeight = 320,
}: FlipCardProps) {
  return (
    <div className={clsx("w-full [perspective:1200px]", className)} style={{ minHeight }}>
      <div
        className={clsx(
          "relative h-full w-full [transform-style:preserve-3d]",
          "transition-transform duration-700 ease-[cubic-bezier(0.34,1.25,0.64,1)]",
          flipped && "[transform:rotateY(180deg)]"
        )}
        style={{ minHeight }}
      >
        <button
          type="button"
          onClick={onFlip}
          disabled={flipped}
          aria-hidden={flipped}
          aria-label="Reveal answer"
          className={clsx(
            faceStyles,
            "cursor-pointer text-left transition-shadow",
            "hover:shadow-md hover:ring-zinc-950/10 dark:hover:ring-white/15",
            "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
            flipped && "pointer-events-none"
          )}
        >
          {front}
        </button>

        <div aria-hidden={!flipped} className={clsx(faceStyles, "[transform:rotateY(180deg)]")}>
          {back}
        </div>
      </div>
    </div>
  );
}

export function FlipCardLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs/5 font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
      {children}
    </span>
  );
}

export function FlipCardBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "flex flex-1 flex-col items-center justify-center px-6 py-8 text-center sm:px-10 sm:py-10",
        className
      )}
    >
      {children}
    </div>
  );
}

function IconChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.75 8H13.25M2.75 8L5.25 5.5M2.75 8L5.25 10.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M13.25 8L2.75 8M13.25 8L10.75 10.5M13.25 8L10.75 5.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type FlipCardNavBodyProps = {
  children: ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  className?: string;
};

/** Card body with left/right halves that navigate to the previous or next card. */
export function FlipCardNavBody({
  children,
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
  className,
}: FlipCardNavBodyProps) {
  const navZoneBase = [
    "absolute inset-y-0 z-10 w-1/2 overflow-hidden bg-transparent",
    "before:pointer-events-none before:absolute before:inset-0 before:opacity-0",
    "before:transition-opacity before:duration-200 before:ease-out before:content-['']",
    "focus-visible:outline-hidden focus-visible:before:opacity-100",
  ];

  const navZoneLeftGradient = hasPrevious
    ? [
        "cursor-pointer hover:before:opacity-100",
        "before:bg-[radial-gradient(ellipse_90%_120%_at_100%_50%,--theme(--color-indigo-500/.14),transparent_70%)]",
        "dark:before:bg-[radial-gradient(ellipse_90%_120%_at_100%_50%,--theme(--color-indigo-400/.16),transparent_70%)]",
      ]
    : "cursor-default";

  const navZoneRightGradient = hasNext
    ? [
        "cursor-pointer hover:before:opacity-100",
        "before:bg-[radial-gradient(ellipse_90%_120%_at_0%_50%,--theme(--color-indigo-500/.14),transparent_70%)]",
        "dark:before:bg-[radial-gradient(ellipse_90%_120%_at_0%_50%,--theme(--color-indigo-400/.16),transparent_70%)]",
      ]
    : "cursor-default";

  return (
    <div
      className={clsx(
        "relative flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-900",
        className
      )}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="Previous card"
        className={clsx("group/left left-0", navZoneBase, navZoneLeftGradient)}
      >
        <IconChevronLeft
          className={clsx(
            "pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-indigo-400/80 transition-all duration-200",
            hasPrevious
              ? "opacity-0 group-hover/left:translate-x-0.5 group-hover/left:opacity-100 group-focus-visible/left:opacity-100"
              : "opacity-0"
          )}
        />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next card"
        className={clsx("group/right right-0", navZoneBase, navZoneRightGradient)}
      >
        <IconChevronRight
          className={clsx(
            "pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-indigo-400/80 transition-all duration-200",
            hasNext
              ? "opacity-0 group-hover/right:-translate-x-0.5 group-hover/right:opacity-100 group-focus-visible/right:opacity-100"
              : "opacity-0"
          )}
        />
      </button>

      <div className="pointer-events-none relative z-0 flex flex-1 flex-col items-center justify-center bg-white px-6 py-8 text-center sm:px-10 sm:py-10 dark:bg-zinc-900">
        {children}
      </div>
    </div>
  );
}

export function FlipCardHint({ children }: { children: ReactNode }) {
  return (
    <p className="border-t border-zinc-950/5 px-6 py-3 text-center text-xs/5 text-zinc-500 dark:border-white/10 dark:text-zinc-400">
      {children}
    </p>
  );
}
