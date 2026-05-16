"use client";

import { createDeck, deleteDeck, updateDeck } from "@/actions/decks";
import type { DeckListItem } from "@/lib/types/database";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/app/components/dialog";
import { Divider } from "@/app/components/divider";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "@/app/components/dropdown";
import { Description, Field, Label } from "@/app/components/fieldset";
import { Heading, Subheading } from "@/app/components/heading";
import { Input } from "@/app/components/input";
import { Link } from "@/app/components/link";
import { Text } from "@/app/components/text";
import { Textarea } from "@/app/components/textarea";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Switch, SwitchField } from "@/app/components/switch";

import { DeckCreateWizard } from "./deck-create-wizard";

const TEMP_DECK_PREFIX = "temp-deck-";

function isTempDeckId(id: string) {
  return id.startsWith(TEMP_DECK_PREFIX);
}

function IconDotsVertical(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 14a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
    </svg>
  );
}

function IconEye(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.514 1.514 0 0 1 0-1.186c 1.985-4.704 7.416-6.762 11.683-4.762 2.824 1.286 4.725 4.028 5.152 7.144a1.474 1.474 0 0 1 0 .894c-.483 2.894-2.153 5.528-4.591 6.984a9.042 9.042 0 0 1-4.34 1.097C5.862 21.657 2.016 18.41.664 14.409a1.474 1.474 0 0 1 0-.894l.008-.018.015-.036a1.474 1.474 0 0 1-.023-.871Zm1.777-.482c1.156 3.312 4.408 5.926 8.034 5.926a7.04 7.04 0 0 0 3.378-.854c2.013-1.21 3.357-3.336 3.762-5.762v-.064c-.395-2.284-1.611-4.312-3.398-5.454a7.562 7.562 0 0 0-7.484-.052C4.148 5.054 2.092 7.48 2.441 10.108Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconPencil(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="m2.695 14.407 8.47-8.47 3.828 3.828-8.47 8.47a1.875 1.875 0 0 1-.664.423l-3.759 1.253a.375.375 0 0 1-.474-.474l1.253-3.759c.08-.241.226-.465.423-.664l-.607-.607Z" />
      <path d="m12.943 3.159 3.828 3.828 1.06-1.06a2.75 2.75 0 0 0-3.889-3.889l-1.06 1.06Z" />
    </svg>
  );
}

function IconDuplicate(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6 4.75A.75.75 0 0 1 6.75 4h7.5a.75.75 0 0 1 .75.75V8h1V4.75A1.75 1.75 0 0 0 14.25 3h-7.5A1.75 1.75 0 0 0 5 4.75v8.5c0 .966.784 1.75 1.75 1.75H11v-1H6.75A.75.75 0 0 1 6 13.25V4.75Z" />
      <path
        fillRule="evenodd"
        d="M9 8.75A1.75 1.75 0 0 1 10.75 7h4.5A1.75 1.75 0 0 1 17 8.75v6.5A1.75 1.75 0 0 1 15.25 17h-4.5A1.75 1.75 0 0 1 9 15.25v-6.5Zm1.75-.25a.25.25 0 0 0-.25.25v6.5c0 .138.112.25.25.25h4.5a.25.25 0 0 0 .25-.25v-6.5a.25.25 0 0 0-.25-.25h-4.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconTrash(props: React.ComponentPropsWithoutRef<"svg">) {
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

function IconPlus(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function DeckStacksDecoration({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="flex -space-x-3 opacity-90">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="relative inline-flex size-10 rounded-lg ring-2 ring-white shadow-sm dark:ring-zinc-900"
            style={{
              background: `linear-gradient(135deg, rgb(99 102 241 / ${0.35 + i * 0.12}), rgb(14 165 233 / ${0.25 + i * 0.1}))`,
              transform: `rotate(${-6 + i * 6}deg)`,
              zIndex: 3 - i,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DeckCard({
  deck,
  updateDeckList,
  fallbackOwnerUserId,
}: {
  deck: DeckListItem;
  updateDeckList: (recipe: (prev: DeckListItem[]) => DeckListItem[]) => void;
  fallbackOwnerUserId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(deck.title);
  const [draftDescription, setDraftDescription] = useState(deck.description ?? "");
  const [draftPublic, setDraftPublic] = useState(deck.is_public);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (deleteOpen) setDeleteError(null);
  }, [deleteOpen]);

  useEffect(() => {
    if (!editOpen) return;
    setDraftTitle(deck.title);
    setDraftDescription(deck.description ?? "");
    setDraftPublic(deck.is_public);
    setEditError(null);
  }, [editOpen, deck.title, deck.description, deck.is_public]);

  async function handleSaveEdit() {
    if (isTempDeckId(deck.id)) return;
    if (!draftTitle.trim()) {
      setEditError("Title is required.");
      return;
    }
    setEditSaving(true);
    setEditError(null);
    const previous = deck;
    updateDeckList((prev) =>
      prev.map((d) =>
        d.id === deck.id
          ? {
              ...d,
              title: draftTitle.trim() || d.title,
              description: draftDescription.trim() ? draftDescription.trim() : null,
              is_public: draftPublic,
            }
          : d
      )
    );
    const result = await updateDeck({
      id: deck.id,
      title: draftTitle,
      description: draftDescription,
      is_public: draftPublic,
    });
    setEditSaving(false);
    if (result.error || !result.data) {
      updateDeckList((prev) => prev.map((d) => (d.id === deck.id ? previous : d)));
      setEditError(result.error ?? "Could not save changes.");
      return;
    }
    updateDeckList((prev) => prev.map((d) => (d.id === deck.id ? result.data! : d)));
    setEditOpen(false);
  }

  async function handleConfirmDelete() {
    if (isTempDeckId(deck.id)) return;
    setDeleteBusy(true);
    setDeleteError(null);
    const snapshot = deck;
    updateDeckList((prev) => prev.filter((d) => d.id !== deck.id));
    const result = await deleteDeck({ id: deck.id });
    setDeleteBusy(false);
    if (result.error) {
      updateDeckList((prev) => {
        if (prev.some((d) => d.id === snapshot.id)) return prev;
        const next = [...prev, snapshot];
        return next.sort((a, b) => a.title.localeCompare(b.title));
      });
      setDeleteError(result.error);
      return;
    }
    setDeleteOpen(false);
  }

  const titleLink = (
    <Subheading level={3} className="line-clamp-2 text-pretty">
      {deck.title}
    </Subheading>
  );

  return (
    <>
      <div className="group relative rounded-2xl bg-white shadow-xs ring-1 ring-zinc-950/5 transition hover:shadow-sm hover:ring-zinc-950/10 dark:bg-zinc-950/40 dark:ring-white/10 dark:hover:ring-white/15">
        <div className="flex min-w-0 flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-6">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
              {isTempDeckId(deck.id) ? (
                <div className="min-w-0 text-left">{titleLink}</div>
              ) : (
                <Link
                  href={`/decks/${deck.id}`}
                  className="min-w-0 text-left transition hover:opacity-80"
                >
                  {titleLink}
                </Link>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {deck.is_public ? (
                  <Badge color="sky">Public</Badge>
                ) : (
                  <Badge color="zinc">Private</Badge>
                )}
                <span className="text-xs/5 font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                  {deck.card_count} {deck.card_count === 1 ? "card" : "cards"}
                </span>
              </div>
            </div>
            {deck.description ? (
              <Text className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
                {deck.description}
              </Text>
            ) : null}
            <Text className="text-xs/5 font-mono text-zinc-400 dark:text-zinc-500">
              {deck.user_id
                ? `Owner ${deck.user_id.slice(0, 8)}…`
                : fallbackOwnerUserId
                  ? `Owner ${fallbackOwnerUserId.slice(0, 8)}…`
                  : "Owner · assigning…"}
            </Text>
          </div>

          <div className="relative z-10 flex shrink-0 items-start justify-end gap-3 sm:flex-col sm:items-end">
            <DeckStacksDecoration className="pointer-events-none hidden sm:block" />
            <Dropdown>
              <DropdownButton
                as="button"
                type="button"
                className="flex size-9 shrink-0 cursor-default items-center justify-center rounded-lg border border-transparent text-zinc-500 outline-hidden hover:bg-zinc-950/5 hover:text-zinc-950 focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={`Deck actions for ${deck.title}`}
              >
                <IconDotsVertical data-slot="icon" className="size-5 sm:size-4" />
              </DropdownButton>
              <DropdownMenu anchor="bottom end" className="z-50 min-w-[12rem]">
                {isTempDeckId(deck.id) ? (
                  <DropdownItem disabled>
                    <IconEye data-slot="icon" className="size-5 shrink-0 sm:size-4" />
                    <DropdownLabel>Read · Open deck (saving…)</DropdownLabel>
                  </DropdownItem>
                ) : (
                  <DropdownItem href={`/decks/${deck.id}`}>
                    <IconEye data-slot="icon" className="size-5 shrink-0 sm:size-4" />
                    <DropdownLabel>Read · Open deck</DropdownLabel>
                  </DropdownItem>
                )}
                <DropdownItem
                  onClick={() => !isTempDeckId(deck.id) && setEditOpen(true)}
                  disabled={isTempDeckId(deck.id)}
                >
                  <IconPencil data-slot="icon" className="size-5 shrink-0 sm:size-4" />
                  <DropdownLabel>Update · Edit details</DropdownLabel>
                </DropdownItem>
                <DropdownItem onClick={() => setDuplicateOpen(true)}>
                  <IconDuplicate data-slot="icon" className="size-5 shrink-0 sm:size-4" />
                  <DropdownLabel>Create · Duplicate deck</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem
                  onClick={() => !isTempDeckId(deck.id) && setDeleteOpen(true)}
                  disabled={isTempDeckId(deck.id)}
                  className="text-red-600 data-focus:bg-red-500 data-focus:text-white dark:text-red-400 dark:data-focus:bg-red-600 dark:data-focus:text-white"
                >
                  <IconTrash data-slot="icon" className="size-5 shrink-0 sm:size-4" />
                  <DropdownLabel>Delete deck</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onClose={setEditOpen} size="md">
        <DialogTitle>Edit deck</DialogTitle>
        <DialogDescription>Update the title, description, and visibility for this deck.</DialogDescription>
        <DialogBody>
          <div className="space-y-6">
            {editError ? (
              <div
                role="alert"
                className="rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                {editError}
              </div>
            ) : null}
            <Field>
              <Label>Title</Label>
              <Input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                name="title"
                disabled={editSaving}
              />
            </Field>
            <Field>
              <Label>Description</Label>
              <Description>Optional context shown on the deck card.</Description>
              <Textarea
                name="description"
                rows={3}
                resizable={false}
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                disabled={editSaving}
              />
            </Field>
            <SwitchField>
              <Label>Public visibility</Label>
              <Description>Anyone with a link can study public decks once sharing ships.</Description>
              <Switch color="indigo" checked={draftPublic} onChange={setDraftPublic} disabled={editSaving} />
            </SwitchField>
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setEditOpen(false)} disabled={editSaving}>
            Cancel
          </Button>
          <Button color="indigo" onClick={() => void handleSaveEdit()} disabled={editSaving}>
            {editSaving ? "Saving…" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={duplicateOpen} onClose={setDuplicateOpen} size="sm">
        <DialogTitle>Duplicate deck</DialogTitle>
        <DialogDescription>
          Deck duplication will create a new deck from this one once the create flow is wired to the
          database.
        </DialogDescription>
        <DialogActions>
          <Button color="zinc" onClick={() => setDuplicateOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={setDeleteOpen} size="sm">
        <DialogTitle>Delete deck permanently?</DialogTitle>
        <DialogDescription>
          You are about to delete <span className="font-semibold text-zinc-950 dark:text-white">&quot;{deck.title}&quot;</span>
          . This cannot be undone and removes the deck from your library.
        </DialogDescription>
        {deleteError ? (
          <DialogBody>
            <div
              role="alert"
              className="rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {deleteError}
            </div>
          </DialogBody>
        ) : null}
        <DialogActions>
          <Button plain onClick={() => setDeleteOpen(false)} disabled={deleteBusy}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => void handleConfirmDelete()}
            disabled={deleteBusy}
            className="ring-2 ring-red-600/80 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950"
          >
            {deleteBusy ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function DecksView({
  decks,
  fetchError,
}: {
  decks: DeckListItem[];
  fetchError: string | null;
}) {
  const [deckList, setDeckList] = useState(decks);
  const [composerPrompt, setComposerPrompt] = useState("");
  const [composerHint, setComposerHint] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardPrompt, setWizardPrompt] = useState("");
  const [wizardSession, setWizardSession] = useState(0);

  const [newDeckOpen, setNewDeckOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDeckError, setNewDeckError] = useState<string | null>(null);
  const [newDeckSubmitting, setNewDeckSubmitting] = useState(false);
  const [createBanner, setCreateBanner] = useState<string | null>(null);

  useEffect(() => {
    setDeckList(decks);
  }, [decks]);

  const updateDeckList = useCallback((recipe: (prev: DeckListItem[]) => DeckListItem[]) => {
    setDeckList(recipe);
  }, []);

  const fallbackOwnerUserId = deckList.find((d) => d.user_id)?.user_id ?? "";

  function resetNewDeckForm() {
    setNewTitle("");
    setNewDescription("");
    setNewDeckError(null);
  }

  function closeNewDeckDialog(open: boolean) {
    setNewDeckOpen(open);
    if (!open) resetNewDeckForm();
  }

  async function handleCreateDeck() {
    if (newDeckSubmitting) return;
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      setNewDeckError("Title is required.");
      return;
    }
    setNewDeckSubmitting(true);
    setNewDeckError(null);
    setCreateBanner(null);

    const tempId = `${TEMP_DECK_PREFIX}${crypto.randomUUID()}`;
    const optimistic: DeckListItem = {
      id: tempId,
      user_id: fallbackOwnerUserId,
      title: trimmedTitle,
      description: newDescription.trim() ? newDescription.trim() : null,
      is_public: false,
      card_count: 0,
    };

    setDeckList((prev) => [...prev, optimistic].sort((a, b) => a.title.localeCompare(b.title)));

    const result = await createDeck({ title: trimmedTitle, description: newDescription });
    setNewDeckSubmitting(false);

    if (result.error || !result.data) {
      setDeckList((prev) => prev.filter((d) => d.id !== tempId));
      setCreateBanner(result.error ?? "Could not create deck.");
      return;
    }

    setDeckList((prev) => prev.map((d) => (d.id === tempId ? result.data! : d)));
    resetNewDeckForm();
    setNewDeckOpen(false);
  }

  function openCreateWizard() {
    const trimmed = composerPrompt.trim();
    if (!trimmed) {
      setComposerHint("Add a topic or instructions first.");
      return;
    }
    setComposerHint(null);
    setWizardPrompt(trimmed);
    setWizardSession((n) => n + 1);
    setWizardOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 sm:space-y-12">
      <header className="space-y-2">
        <Heading>Decks</Heading>
        <Text className="max-w-2xl text-pretty">
          Every deck in the workspace—shown without user filtering until authentication ships. Use the
          composer for quick captures; row menus cover the full CRUD surface area at a glance.
        </Text>
      </header>

      {fetchError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/25 bg-red-500/5 px-5 py-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          <p className="font-medium">Could not load decks</p>
          <p className="mt-1 text-red-700/90 dark:text-red-200/90">{fetchError}</p>
          <p className="mt-3 text-xs text-red-700/80 dark:text-red-200/70">
            Tip: set{" "}
            <code className="rounded bg-red-500/10 px-1 py-0.5 font-mono text-[0.8125rem]">
              SUPABASE_SECRET_KEY
            </code>{" "}
            (or{" "}
            <code className="rounded bg-red-500/10 px-1 py-0.5 font-mono text-[0.8125rem]">
              SUPABASE_SERVICE_ROLE_KEY
            </code>
            ) on the server to list every deck while RLS is still evolving.
          </p>
        </div>
      ) : null}

      {createBanner ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/25 bg-red-500/5 px-5 py-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {createBanner}
        </div>
      ) : null}

      <section
        aria-labelledby="deck-composer-heading"
        className="relative isolate overflow-hidden rounded-2xl bg-zinc-50/80 shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-950/50 dark:ring-white/10"
      >
        <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-50" aria-hidden="true">
          <div className="absolute -left-16 -top-20 size-64 rounded-full bg-indigo-500/12 blur-3xl dark:bg-indigo-400/10 sm:left-0 sm:size-72" />
          <div className="absolute -bottom-20 -right-12 size-72 rounded-full bg-cyan-500/12 blur-3xl dark:bg-cyan-400/10 sm:right-0 sm:size-80" />
        </div>
        <div className="relative space-y-5 p-5 sm:space-y-6 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="min-w-0 space-y-2">
              <Subheading id="deck-composer-heading" level={2}>
                Quick composer
              </Subheading>
              <Text className="max-w-xl text-pretty">
                Drop a working title or topic fragment—pair it with the button when you are ready to
                scaffold a deck.
              </Text>
            </div>
            <Button
              type="button"
              color="indigo"
              className="w-full shrink-0 sm:w-auto"
              onClick={openCreateWizard}
            >
              Create deck
            </Button>
          </div>
          <Textarea
            name="deck_prompt"
            rows={3}
            resizable={false}
            value={composerPrompt}
            onChange={(e) => {
              setComposerPrompt(e.target.value);
              if (composerHint) setComposerHint(null);
            }}
            placeholder="e.g. “JLPT N3 verb pairs — motion verbs, weeknight sprint”"
            aria-label="Deck prompt"
          />
          {composerHint ? (
            <Text className="text-xs/5 text-amber-700 dark:text-amber-300">{composerHint}</Text>
          ) : (
            <Text className="text-xs/5 text-zinc-400 dark:text-zinc-500">
              Uses OpenAI on the server (
              <code className="rounded bg-zinc-950/5 px-1 py-0.5 font-mono dark:bg-white/10">
                OPEN_AI_API_KEY
              </code>
              ). Save requires sign-in or{" "}
              <code className="rounded bg-zinc-950/5 px-1 py-0.5 font-mono dark:bg-white/10">
                GINGER_DECK_OWNER_USER_ID
              </code>{" "}
              when using the service role locally.
            </Text>
          )}
        </div>
      </section>

      <DeckCreateWizard
        key={wizardSession}
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialPrompt={wizardPrompt}
      />

      <Divider soft className="my-1" />

      <section aria-labelledby="deck-library-heading" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <Subheading id="deck-library-heading" level={2}>
              Library
            </Subheading>
            <Text>
              {fetchError
                ? "Fix the error above to hydrate this list."
                : deckList.length === 0
                  ? "No decks yet—seed the database or add one with New Deck."
                  : `${deckList.length} deck${deckList.length === 1 ? "" : "s"} across all owners`}
            </Text>
          </div>
          <Button
            type="button"
            color="indigo"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => setNewDeckOpen(true)}
          >
            <IconPlus data-slot="icon" />
            New Deck
          </Button>
        </div>

        <Dialog open={newDeckOpen} onClose={closeNewDeckDialog} size="md">
          <DialogTitle>New deck</DialogTitle>
          <DialogDescription>Add a title and an optional description. The deck appears in your library right away.</DialogDescription>
          <DialogBody>
            <div className="space-y-6">
              {newDeckError ? (
                <div
                  role="alert"
                  className="rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                >
                  {newDeckError}
                </div>
              ) : null}
              <Field>
                <Label>Title</Label>
                <Input
                  name="new_deck_title"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (newDeckError) setNewDeckError(null);
                  }}
                  disabled={newDeckSubmitting}
                  placeholder="e.g. Weeknight Spanish verbs"
                />
              </Field>
              <Field>
                <Label>Description</Label>
                <Description>Optional; shown on the deck card in the library.</Description>
                <Textarea
                  name="new_deck_description"
                  rows={3}
                  resizable={false}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  disabled={newDeckSubmitting}
                />
              </Field>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => closeNewDeckDialog(false)} disabled={newDeckSubmitting}>
              Cancel
            </Button>
            <Button color="indigo" onClick={() => void handleCreateDeck()} disabled={newDeckSubmitting}>
              {newDeckSubmitting ? "Creating…" : "Create deck"}
            </Button>
          </DialogActions>
        </Dialog>

        {!fetchError && deckList.length > 0 ? (
          <ul className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            {deckList.map((deck) => (
              <li key={deck.id}>
                <DeckCard
                  deck={deck}
                  updateDeckList={updateDeckList}
                  fallbackOwnerUserId={fallbackOwnerUserId}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {!fetchError && deckList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-950/15 bg-zinc-950/[0.02] px-6 py-16 text-center sm:px-10 dark:border-white/15 dark:bg-white/[0.03]">
            <Subheading level={3} className="text-zinc-700 dark:text-zinc-300">
              Nothing to show yet
            </Subheading>
            <Text className="mx-auto mt-2 max-w-md">
              Run your seed script or use <span className="font-medium text-zinc-800 dark:text-zinc-200">New Deck</span>{" "}
              to add your first deck.
            </Text>
          </div>
        ) : null}
      </section>
    </div>
  );
}
