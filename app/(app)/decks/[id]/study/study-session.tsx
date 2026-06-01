"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  FlipCard,
  FlipCardBody,
  FlipCardHint,
  FlipCardLabel,
  FlipCardNavBody,
} from "@/components/flip-card";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { SegmentedProgressBar } from "@/components/progress-bar";
import { Code, Text } from "@/components/text";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { StudySessionComplete, type SessionStats } from "./study-session-complete";

type StudyCard = {
  id: string;
  front: string;
  back: string;
};

function shuffleCards<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function StudySession({
  deckId,
  deckTitle,
  cards: deckCards,
}: {
  deckId: string;
  deckTitle: string;
  cards: StudyCard[];
}) {
  const [sessionCards, setSessionCards] = useState<StudyCard[]>(() => [...deckCards]);
  const [shuffled, setShuffled] = useState(false);
  const [phase, setPhase] = useState<"studying" | "complete">("studying");
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set());
  const sessionStartedAtRef = useRef(Date.now());

  const cards = sessionCards;

  const total = cards.length;
  const safeIndex = total === 0 ? 0 : Math.min(index, total - 1);
  const card = cards[safeIndex];
  const hasPrevious = safeIndex > 0;
  const hasNext = safeIndex < total - 1;
  const canFinish = flipped && safeIndex === total - 1;

  useEffect(() => {
    if (total > 0 && index >= total) {
      setIndex(total - 1);
      setFlipped(false);
    }
  }, [index, total]);

  useEffect(() => {
    if (!flipped || !card) return;

    setSeenIds((current) => {
      if (current.has(card.id)) return current;
      const next = new Set(current);
      next.add(card.id);
      return next;
    });
  }, [flipped, card]);

  const completeSession = useCallback(() => {
    setSeenIds((current) => {
      const finalSeen =
        card && flipped && !current.has(card.id)
          ? new Set([...current, card.id])
          : current;

      setSessionStats({
        totalCards: total,
        seenCount: finalSeen.size,
        durationMs: Date.now() - sessionStartedAtRef.current,
        shuffled,
      });
      setPhase("complete");
      return finalSeen;
    });
  }, [card, flipped, shuffled, total]);

  const goPrevious = useCallback(() => {
    if (!hasPrevious) return;
    setFlipped(false);
    setIndex((current) => current - 1);
  }, [hasPrevious]);

  const advance = useCallback(() => {
    if (!flipped) return;

    if (hasNext) {
      setFlipped(false);
      setIndex((current) => current + 1);
      return;
    }

    completeSession();
  }, [completeSession, flipped, hasNext]);

  const reveal = useCallback(() => {
    if (!flipped) setFlipped(true);
  }, [flipped]);

  const restartSession = useCallback(() => {
    setSessionCards(shuffled ? shuffleCards(deckCards) : [...deckCards]);
    setIndex(0);
    setFlipped(false);
    setSeenIds(new Set());
    setPhase("studying");
    setSessionStats(null);
    sessionStartedAtRef.current = Date.now();
  }, [deckCards, shuffled]);

  const toggleShuffle = useCallback(() => {
    setShuffled((current) => {
      const next = !current;
      setSessionCards(next ? shuffleCards(deckCards) : [...deckCards]);
      setIndex(0);
      setFlipped(false);
      setSeenIds(new Set());
      setPhase("studying");
      setSessionStats(null);
      sessionStartedAtRef.current = Date.now();
      return next;
    });
  }, [deckCards]);

  useEffect(() => {
    if (phase === "complete") return;

    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;

      const key = event.key;

      if (key === " " || key === "ArrowUp") {
        if (!flipped) {
          event.preventDefault();
          setFlipped(true);
        }
        return;
      }

      if (key === "ArrowLeft" || key.toLowerCase() === "h") {
        event.preventDefault();
        goPrevious();
        return;
      }

      if ((key === "ArrowRight" || key.toLowerCase() === "l") && flipped) {
        event.preventDefault();
        advance();
        return;
      }

      if (key.toLowerCase() === "r") {
        event.preventDefault();
        restartSession();
        return;
      }

      if (key.toLowerCase() === "s") {
        event.preventDefault();
        toggleShuffle();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance, flipped, goPrevious, phase, restartSession, toggleShuffle]);

  const seenCount = seenIds.size;
  const progressSegments = cards.map((studyCard, segmentIndex) => ({
    id: studyCard.id,
    complete: seenIds.has(studyCard.id),
    label: `Card ${segmentIndex + 1}${seenIds.has(studyCard.id) ? ", seen" : ", not seen"}`,
  }));

  if (phase === "complete" && sessionStats) {
    return (
      <StudySessionComplete
        deckId={deckId}
        stats={sessionStats}
        onStudyAgain={restartSession}
      />
    );
  }

  if (total === 0 || !card) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-16 pt-2 sm:pb-20">
        <Link
          href={`/decks/${deckId}`}
          className="text-sm/6 font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          ← Back to deck
        </Link>
        <Heading level={1}>Study</Heading>
        <Text>This deck has no cards yet. Add some cards to start studying.</Text>
        <Button outline href={`/decks/${deckId}`}>
          Back to deck
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-16 pt-2 sm:gap-10 sm:pb-20">
      <header className="space-y-4">
        <Link
          href={`/decks/${deckId}`}
          className="text-sm/6 font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          ← Back to deck
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <Heading level={1}>Study</Heading>
            <Text className="text-zinc-600 dark:text-zinc-300">{deckTitle}</Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {shuffled ? <Badge color="violet">Shuffled</Badge> : null}
            <Badge color="zinc">
              Card {safeIndex + 1} of {total}
            </Badge>
          </div>
        </div>
      </header>

      <SegmentedProgressBar
        segments={progressSegments}
        summary={`${seenCount} of ${total} ${total === 1 ? "card" : "cards"} seen`}
        aria-label="Cards seen in this session"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <FlipCard
            flipped={flipped}
            onFlip={reveal}
            minHeight={360}
            front={
              <>
                <FlipCardBody>
                  <FlipCardLabel>Question</FlipCardLabel>
                  <p className="mt-4 text-pretty text-xl/8 font-medium text-zinc-950 sm:text-2xl/9 dark:text-white">
                    {card.front}
                  </p>
                </FlipCardBody>
                <FlipCardHint>Click the card to reveal the answer</FlipCardHint>
              </>
            }
            back={
              <>
                <FlipCardNavBody
                  onPrevious={goPrevious}
                  onNext={advance}
                  hasPrevious={hasPrevious}
                  hasNext={hasNext || canFinish}
                >
                  <FlipCardLabel>Answer</FlipCardLabel>
                  <p className="mt-4 text-pretty text-lg/8 text-zinc-700 sm:text-xl/8 dark:text-zinc-200">
                    {card.back}
                  </p>
                  <p className="mt-6 text-sm/6 font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                    {safeIndex + 1} / {total}
                  </p>
                </FlipCardNavBody>
                <FlipCardHint>
                  {hasNext
                    ? "Tap the left or right side to navigate"
                    : "Tap the right side to finish the session"}
                </FlipCardHint>
              </>
            }
          />
        </motion.div>
      </AnimatePresence>

      <section
        aria-label="Keyboard shortcuts"
        className="rounded-xl border border-zinc-950/10 bg-zinc-950/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <p className="text-sm/6 font-semibold text-zinc-950 dark:text-white">Keyboard shortcuts</p>
        <div className="mt-3 grid gap-2 text-sm/6 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">Flip card</span>
            <span className="flex items-center gap-1.5">
              <Code>Space</Code>
              <span className="text-zinc-400">or</span>
              <Code>↑</Code>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">Next card</span>
            <span className="flex items-center gap-1.5">
              <Code>→</Code>
              <span className="text-zinc-400">or</span>
              <Code>L</Code>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">Previous card</span>
            <span className="flex items-center gap-1.5">
              <Code>←</Code>
              <span className="text-zinc-400">or</span>
              <Code>H</Code>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">Restart session</span>
            <span>
              <Code>R</Code>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <span className="text-zinc-500 dark:text-zinc-400">Toggle shuffle</span>
            <span>
              <Code>S</Code>
            </span>
          </div>
        </div>
        <Text className="mt-3 text-center text-xs/5">
          Next only works after you flip the card. Click the card or use Space to reveal the answer.
        </Text>
      </section>
    </div>
  );
}
