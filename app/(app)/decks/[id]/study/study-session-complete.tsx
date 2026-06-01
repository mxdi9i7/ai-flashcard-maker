"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/description-list";
import { Divider } from "@/components/divider";
import { Heading, Subheading } from "@/components/heading";
import { Text } from "@/components/text";
import { motion } from "motion/react";

export type SessionStats = {
  totalCards: number;
  seenCount: number;
  durationMs: number;
  shuffled: boolean;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function StudySessionComplete({
  deckId,
  stats,
  onStudyAgain,
}: {
  deckId: string;
  stats: SessionStats;
  onStudyAgain: () => void;
}) {
  const completionPercent =
    stats.totalCards === 0 ? 0 : Math.round((stats.seenCount / stats.totalCards) * 100);
  const missedCount = Math.max(0, stats.totalCards - stats.seenCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-16 pt-2 sm:gap-10 sm:pb-20"
    >
      <header className="space-y-4 text-center sm:text-left">
        <Badge color="green">Session complete</Badge>
        <div className="space-y-2">
          <Heading level={1}>Nice work!</Heading>
          <Text className="text-pretty text-zinc-600 dark:text-zinc-300">
            You finished this study session. Here&apos;s how you did.
          </Text>
        </div>
      </header>

      <section
        aria-labelledby="session-stats-heading"
        className="overflow-hidden rounded-2xl border border-zinc-950/10 bg-white shadow-sm ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-900 dark:ring-white/10"
      >
        <div className="border-b border-zinc-950/5 px-5 py-4 dark:border-white/10 sm:px-6">
          <Subheading id="session-stats-heading" level={2}>
            Session summary
          </Subheading>
        </div>

        <div className="px-5 py-2 sm:px-6">
          <DescriptionList>
            <DescriptionTerm>Cards in deck</DescriptionTerm>
            <DescriptionDetails>{stats.totalCards}</DescriptionDetails>

            <DescriptionTerm>Cards seen</DescriptionTerm>
            <DescriptionDetails>
              {stats.seenCount} of {stats.totalCards}
            </DescriptionDetails>

            <DescriptionTerm>Completion</DescriptionTerm>
            <DescriptionDetails>{completionPercent}%</DescriptionDetails>

            <DescriptionTerm>Time spent</DescriptionTerm>
            <DescriptionDetails>{formatDuration(stats.durationMs)}</DescriptionDetails>

            <DescriptionTerm>Card order</DescriptionTerm>
            <DescriptionDetails>{stats.shuffled ? "Shuffled" : "In order"}</DescriptionDetails>

            {missedCount > 0 ? (
              <>
                <DescriptionTerm>Skipped</DescriptionTerm>
                <DescriptionDetails>
                  {missedCount} unreviewed {missedCount === 1 ? "card" : "cards"}
                </DescriptionDetails>
              </>
            ) : null}
          </DescriptionList>
        </div>
      </section>

      <Divider soft />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button color="indigo" className="w-full justify-center sm:flex-1" onClick={onStudyAgain}>
          Study again
        </Button>
        <Button outline href={`/decks/${deckId}`} className="w-full justify-center sm:flex-1">
          Back to deck
        </Button>
      </div>
    </motion.div>
  );
}
