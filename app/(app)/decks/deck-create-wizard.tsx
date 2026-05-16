"use client";

import * as Headless from "@headlessui/react";
import { Button } from "@/app/components/button";
import { Divider } from "@/app/components/divider";
import { Description, Field, Label } from "@/app/components/fieldset";
import { Subheading } from "@/app/components/heading";
import { Input } from "@/app/components/input";
import { Switch, SwitchField } from "@/app/components/switch";
import { Text } from "@/app/components/text";
import { Textarea } from "@/app/components/textarea";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import clsx from "clsx";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { DraftCard } from "./deck-draft-types";
import { DeckCardDragOverlay, SortableDeckCard } from "./deck-create-sortable-card";

export type { DraftCard };

type Step = "generating" | "preview" | "saving";

function defaultTitleFromPrompt(prompt: string) {
  const line = prompt.split("\n").find((l) => l.trim().length > 0)?.trim();
  if (!line) return "New deck";
  return line.length > 80 ? `${line.slice(0, 77)}…` : line;
}

function mapApiCards(rows: { front: string; back: string }[]): DraftCard[] {
  return rows.map((c) => ({
    id: crypto.randomUUID(),
    front: c.front,
    back: c.back,
  }));
}

export function DeckCreateWizard({
  open,
  onClose,
  initialPrompt,
}: {
  open: boolean;
  onClose: () => void;
  initialPrompt: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("generating");
  const [promptDraft, setPromptDraft] = useState(initialPrompt);
  const [cards, setCards] = useState<DraftCard[]>([]);
  const [deckTitle, setDeckTitle] = useState(() => defaultTitleFromPrompt(initialPrompt));
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const regenAbortRef = useRef<AbortController | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeDragCard = useMemo(() => {
    if (!activeDragId) return null;
    const index = cards.findIndex((c) => c.id === activeDragId);
    if (index < 0) return null;
    const card = cards[index];
    return card ? { card, index } : null;
  }, [activeDragId, cards]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    setCards((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
  }, []);

  useEffect(() => {
    if (!open) {
      regenAbortRef.current?.abort();
      regenAbortRef.current = null;
      return;
    }
    setStep("generating");
    setPromptDraft(initialPrompt);
    setDeckTitle(defaultTitleFromPrompt(initialPrompt));
    setCards([]);
    setError(null);
    setIsPublic(false);

    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/decks/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: initialPrompt }),
          signal: ac.signal,
        });
        const data = (await res.json().catch(() => ({}))) as { cards?: unknown; error?: string };
        if (!res.ok) {
          setError(data.error ?? "Generation failed.");
          setStep("preview");
          return;
        }
        const raw = data.cards;
        if (!Array.isArray(raw)) {
          setError("Unexpected response from the server.");
          setStep("preview");
          return;
        }
        const normalized: { front: string; back: string }[] = [];
        for (const row of raw) {
          if (!row || typeof row !== "object") continue;
          const r = row as Record<string, unknown>;
          if (typeof r.front !== "string" || typeof r.back !== "string") continue;
          normalized.push({ front: r.front, back: r.back });
        }
        setCards(mapApiCards(normalized));
        setStep("preview");
      } catch (e) {
        if (ac.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Generation failed.");
        setStep("preview");
      }
    })();

    return () => ac.abort();
  }, [open, initialPrompt]);

  const handleDialogClose = useCallback(() => {
    if (step === "saving") return;
    if (step === "generating") return;
    onClose();
  }, [onClose, step]);

  const moveCard = useCallback((id: string, delta: number) => {
    setCards((prev) => {
      const i = prev.findIndex((c) => c.id === id);
      if (i < 0) return prev;
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const t = next[i];
      const u = next[j];
      if (!t || !u) return prev;
      next[i] = u;
      next[j] = t;
      return next;
    });
  }, []);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCard = useCallback((id: string, field: "front" | "back", value: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }, []);

  const addCard = useCallback(() => {
    setCards((prev) => [
      ...prev,
      { id: crypto.randomUUID(), front: "", back: "" },
    ]);
  }, []);

  const regenerate = useCallback(async () => {
    const p = promptDraft.trim();
    if (!p) {
      setError("Add a prompt before regenerating.");
      return;
    }
    regenAbortRef.current?.abort();
    const ac = new AbortController();
    regenAbortRef.current = ac;
    setError(null);
    setStep("generating");
    try {
      const res = await fetch("/api/decks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: p,
          previousCards: cards.map(({ front, back }) => ({ front, back })),
        }),
        signal: ac.signal,
      });
      const data = (await res.json().catch(() => ({}))) as { cards?: unknown; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Regeneration failed.");
        setStep("preview");
        return;
      }
      const raw = data.cards;
      if (!Array.isArray(raw)) {
        setError("Unexpected response from the server.");
        setStep("preview");
        return;
      }
      const normalized: { front: string; back: string }[] = [];
      for (const row of raw) {
        if (!row || typeof row !== "object") continue;
        const r = row as Record<string, unknown>;
        if (typeof r.front !== "string" || typeof r.back !== "string") continue;
        normalized.push({ front: r.front, back: r.back });
      }
      setCards(mapApiCards(normalized));
      setStep("preview");
    } catch (e) {
      if (ac.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Regeneration failed.");
      setStep("preview");
    }
  }, [cards, promptDraft]);

  const finalize = useCallback(async () => {
    const title = deckTitle.trim();
    if (!title) {
      setError("Deck title is required.");
      return;
    }
    const trimmed = cards
      .map((c) => ({
        front: c.front.trim(),
        back: c.back.trim(),
      }))
      .filter((c) => c.front.length > 0 && c.back.length > 0);
    if (trimmed.length === 0) {
      setError("Keep at least one card with both sides filled.");
      return;
    }
    setError(null);
    setStep("saving");
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          is_public: isPublic,
          cards: trimmed,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save the deck.");
        setStep("preview");
        return;
      }
      if (!data.id) {
        setError("Save succeeded but no deck id was returned.");
        setStep("preview");
        return;
      }
      onClose();
      router.push(`/decks/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the deck.");
      setStep("preview");
    }
  }, [cards, deckTitle, isPublic, onClose, router]);

  const headerSubtitle = useMemo(() => {
    if (step === "generating") return "Generating flashcards from your prompt…";
    if (step === "saving") return "Saving your deck…";
    return "Review and edit cards, adjust your prompt, then finalize.";
  }, [step]);

  return (
    <Headless.Dialog open={open} onClose={handleDialogClose} className="relative z-[100]">
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-950/60 transition duration-150 data-closed:opacity-0 dark:bg-zinc-950/80"
      />

      <div className="fixed inset-0 flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
        <header className="flex shrink-0 flex-col gap-4 border-b border-zinc-950/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-white/10">
          <div className="min-w-0 space-y-1">
            <Headless.DialogTitle className="text-2xl/8 font-semibold text-balance text-zinc-950 sm:text-xl/8 dark:text-white">
              Create deck
            </Headless.DialogTitle>
            <Text className="text-sm text-zinc-600 dark:text-zinc-400">{headerSubtitle}</Text>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {step === "preview" ? (
              <>
                <Button plain type="button" onClick={onClose}>
                  Close
                </Button>
                <Button color="indigo" type="button" onClick={finalize}>
                  Finalize deck
                </Button>
              </>
            ) : step === "generating" ? (
              <Button plain type="button" onClick={onClose}>
                Cancel
              </Button>
            ) : (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Saving…</span>
            )}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl space-y-8 px-5 py-8 sm:px-8">
            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100"
              >
                {error}
              </div>
            ) : null}

            <section className="space-y-4">
              <Subheading level={2}>Prompt</Subheading>
              <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                Tune how cards are generated. Regenerate replaces the list below with a fresh pass from
                the model.
              </Text>
              <Textarea
                rows={4}
                resizable={false}
                value={promptDraft}
                disabled={step === "generating" || step === "saving"}
                onChange={(e) => setPromptDraft(e.target.value)}
                aria-label="Deck generation prompt"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  color="zinc"
                  disabled={step === "generating" || step === "saving" || !promptDraft.trim()}
                  onClick={() => void regenerate()}
                >
                  Regenerate cards
                </Button>
              </div>
            </section>

            <Divider />

            <section className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <Subheading level={2}>Flashcards</Subheading>
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    Drag the grip for smooth reordering (keyboard accessible too), use arrows, edit inline,
                    or remove a row.
                  </Text>
                </div>
                <Button
                  type="button"
                  outline
                  disabled={step === "generating" || step === "saving"}
                  onClick={addCard}
                >
                  Add card
                </Button>
              </div>

              {step === "generating" && cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-950/15 bg-zinc-950/[0.02] py-20 dark:border-white/15 dark:bg-white/[0.03]">
                  <div
                    className="size-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent dark:border-indigo-400"
                    aria-hidden
                  />
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    Calling the model…
                  </Text>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext
                    items={cards.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="flex flex-col gap-4">
                      {cards.map((card, index) => (
                        <SortableDeckCard
                          key={card.id}
                          card={card}
                          index={index}
                          total={cards.length}
                          previewEnabled={step === "preview"}
                          onMoveUp={() => moveCard(card.id, -1)}
                          onMoveDown={() => moveCard(card.id, 1)}
                          onRemove={() => removeCard(card.id)}
                          onUpdateFront={(value) => updateCard(card.id, "front", value)}
                          onUpdateBack={(value) => updateCard(card.id, "back", value)}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                  <DragOverlay
                    dropAnimation={{
                      duration: 260,
                      easing: "cubic-bezier(0.25, 1, 0.45, 1)",
                      sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                          active: { opacity: "0.35" },
                        },
                      }),
                    }}
                  >
                    {activeDragCard ? (
                      <motion.div
                        initial={{ scale: 0.94, opacity: 0.85 }}
                        animate={{ scale: 1.04, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 460, damping: 32, mass: 0.65 }}
                      >
                        <DeckCardDragOverlay
                          card={activeDragCard.card}
                          index={activeDragCard.index}
                        />
                      </motion.div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </section>

            <Divider />

            <section className="space-y-6 pb-12">
              <Subheading level={2}>Deck details</Subheading>
              <Field>
                <Label>Deck title</Label>
                <Input
                  value={deckTitle}
                  disabled={step !== "preview"}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  name="deck_title"
                />
              </Field>
              <SwitchField>
                <Label>Public visibility</Label>
                <Description>Anyone can discover public decks once sharing is enabled.</Description>
                <Switch color="indigo" checked={isPublic} disabled={step !== "preview"} onChange={setIsPublic} />
              </SwitchField>
            </section>
          </div>
        </div>
      </div>
    </Headless.Dialog>
  );
}
