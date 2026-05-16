"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Field, Label } from "@/app/components/fieldset";
import { Textarea } from "@/app/components/textarea";
import clsx from "clsx";
import type React from "react";
import type { DraftCard } from "./deck-draft-types";

function IconGrip(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 4.75a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM10.75 4.75a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM7 10a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM10.75 10a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM7 15.25a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM10.75 15.25a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0Z" />
    </svg>
  );
}

function IconChevronUp(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06 6.34 11.78a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconChevronDown(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M10.53 13.53a.75.75 0 0 1-1.06 0l-4.25-4.25a.75.75 0 1 1 1.06-1.06L10 11.94l3.66-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconTrashSmall(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.223 0 .437.034.64.099a.75.75 0 1 0 .52-1.408 4.25 4.25 0 0 0-2.32 0 .75.75 0 1 0 .52 1.408c.203-.065.417-.099.64-.099Zm2.343 4.537a.75.75 0 1 0-1.486-.212l-.375 3.371a.75.75 0 0 0 1.486.212l.375-3.371Zm-6.562 0a.75.75 0 1 0-1.486-.212l-.375 3.371a.75.75 0 0 0 1.486.212l.375-3.371Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SortableDeckCard({
  card,
  index,
  total,
  previewEnabled,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdateFront,
  onUpdateBack,
}: {
  card: DraftCard;
  index: number;
  total: number;
  previewEnabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onUpdateFront: (value: string) => void;
  onUpdateBack: (value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: !previewEnabled,
    transition: {
      duration: 220,
      easing: "cubic-bezier(0.25, 1, 0.45, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={clsx(
        "rounded-2xl bg-zinc-50/80 p-4 shadow-xs ring-1 ring-zinc-950/5 will-change-transform dark:bg-zinc-950/40 dark:ring-white/10",
        isDragging && "z-10 opacity-[0.92] shadow-lg ring-2 ring-indigo-500/35 dark:ring-indigo-400/40"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex items-center gap-2 lg:flex-col lg:pt-1">
          <button
            ref={setActivatorNodeRef}
            type="button"
            className={clsx(
              "flex size-9 cursor-grab touch-none items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-950/5 active:cursor-grabbing dark:text-zinc-400 dark:hover:bg-white/10",
              !previewEnabled && "cursor-not-allowed opacity-40"
            )}
            aria-label={`Drag to reorder card ${index + 1}`}
            disabled={!previewEnabled}
            {...listeners}
            {...attributes}
          >
            <IconGrip data-slot="icon" className="size-5" />
          </button>
          <div className="flex gap-1 lg:flex-col">
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-950/5 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-white/10"
              aria-label="Move card up"
              disabled={index === 0 || !previewEnabled}
              onClick={onMoveUp}
            >
              <IconChevronUp className="size-5" />
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-950/5 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-white/10"
              aria-label="Move card down"
              disabled={index >= total - 1 || !previewEnabled}
              onClick={onMoveDown}
            >
              <IconChevronDown className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <Field>
            <Label>Front · Card {index + 1}</Label>
            <Textarea
              rows={2}
              resizable={false}
              value={card.front}
              disabled={!previewEnabled}
              onChange={(e) => onUpdateFront(e.target.value)}
            />
          </Field>
          <Field>
            <Label>Back</Label>
            <Textarea
              rows={3}
              resizable={false}
              value={card.back}
              disabled={!previewEnabled}
              onChange={(e) => onUpdateBack(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex justify-end lg:pt-1">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-500/15"
            aria-label="Remove card"
            disabled={!previewEnabled}
            onClick={onRemove}
          >
            <IconTrashSmall className="size-5" />
          </button>
        </div>
      </div>
    </li>
  );
}

/** Lightweight preview shown under the cursor / overlay while dragging */
export function DeckCardDragOverlay({
  card,
  index,
}: {
  card: DraftCard;
  index: number;
}) {
  return (
    <div className="pointer-events-none w-[min(100vw-2rem,42rem)] rounded-2xl bg-white p-5 shadow-2xl ring-2 ring-indigo-500/40 dark:bg-zinc-900 dark:ring-indigo-400/45">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
        Card {index + 1}
      </p>
      <p className="mt-2 line-clamp-3 text-sm font-medium text-zinc-950 dark:text-white">{card.front}</p>
      <p className="mt-2 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{card.back}</p>
    </div>
  );
}
