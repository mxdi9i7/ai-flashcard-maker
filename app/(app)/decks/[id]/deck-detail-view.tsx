"use client";

import { addCard, deleteCard, updateCard } from "@/actions/cards";
import { deleteDeck, updateDeck } from "@/actions/decks";
import type { CardRow, DeckWithCards } from "@/lib/types/database";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { Divider } from "@/components/divider";
import { Description, Field, Label } from "@/components/fieldset";
import { Heading, Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import { Switch, SwitchField } from "@/components/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeckDetailView({ deck }: { deck: DeckWithCards }) {
  const router = useRouter();
  const cardCount = deck.cards.length;

  const [editDeckOpen, setEditDeckOpen] = useState(false);
  const [deckTitle, setDeckTitle] = useState(deck.title);
  const [deckDescription, setDeckDescription] = useState(deck.description ?? "");
  const [deckPublic, setDeckPublic] = useState(deck.is_public);
  const [deckSaving, setDeckSaving] = useState(false);
  const [deckFormError, setDeckFormError] = useState<string | null>(null);

  const [deleteDeckOpen, setDeleteDeckOpen] = useState(false);
  const [deleteDeckBusy, setDeleteDeckBusy] = useState(false);
  const [deleteDeckError, setDeleteDeckError] = useState<string | null>(null);

  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editCard, setEditCard] = useState<CardRow | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [editCardBusy, setEditCardBusy] = useState(false);
  const [editCardError, setEditCardError] = useState<string | null>(null);

  const [deleteCardRow, setDeleteCardRow] = useState<CardRow | null>(null);
  const [deleteCardBusy, setDeleteCardBusy] = useState(false);
  const [deleteCardError, setDeleteCardError] = useState<string | null>(null);

  function openEditDeck() {
    setDeckTitle(deck.title);
    setDeckDescription(deck.description ?? "");
    setDeckPublic(deck.is_public);
    setDeckFormError(null);
    setEditDeckOpen(true);
  }

  async function handleSaveDeck() {
    setDeckSaving(true);
    setDeckFormError(null);
    const res = await updateDeck({
      id: deck.id,
      title: deckTitle,
      description: deckDescription,
      is_public: deckPublic,
    });
    setDeckSaving(false);
    if (res.error) {
      setDeckFormError(res.error);
      return;
    }
    setEditDeckOpen(false);
    router.refresh();
  }

  async function handleDeleteDeck() {
    setDeleteDeckBusy(true);
    setDeleteDeckError(null);
    const res = await deleteDeck({ id: deck.id });
    setDeleteDeckBusy(false);
    if (res.error) {
      setDeleteDeckError(res.error);
      return;
    }
    router.push("/decks");
  }

  async function handleAddCard() {
    setAddBusy(true);
    setAddError(null);
    const res = await addCard({ deck_id: deck.id, front: newFront, back: newBack });
    setAddBusy(false);
    if (res.error) {
      setAddError(res.error);
      return;
    }
    setNewFront("");
    setNewBack("");
    router.refresh();
  }

  function openEditCard(c: CardRow) {
    setEditCard(c);
    setEditFront(c.front);
    setEditBack(c.back);
    setEditCardError(null);
  }

  async function handleSaveCard() {
    if (!editCard) return;
    setEditCardBusy(true);
    setEditCardError(null);
    const res = await updateCard({
      id: editCard.id,
      deck_id: deck.id,
      front: editFront,
      back: editBack,
    });
    setEditCardBusy(false);
    if (res.error) {
      setEditCardError(res.error);
      return;
    }
    setEditCard(null);
    router.refresh();
  }

  async function handleConfirmDeleteCard() {
    if (!deleteCardRow) return;
    setDeleteCardBusy(true);
    setDeleteCardError(null);
    const res = await deleteCard({ id: deleteCardRow.id, deck_id: deck.id });
    setDeleteCardBusy(false);
    if (res.error) {
      setDeleteCardError(res.error);
      return;
    }
    setDeleteCardRow(null);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 pb-16 sm:space-y-12 sm:pb-20">
      {/* Zone 1 — Deck header */}
      <header className="space-y-6">
        <div>
          <Link
            href="/decks"
            className="text-sm/6 font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            ← My Decks
          </Link>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <Heading className="text-balance">{deck.title}</Heading>
            {deck.description ? (
              <Text className="max-w-2xl text-pretty text-zinc-600 dark:text-zinc-300">
                {deck.description}
              </Text>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="zinc">
                {cardCount} {cardCount === 1 ? "card" : "cards"}
              </Badge>
              {deck.is_public ? <Badge color="sky">Public</Badge> : null}
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-[11rem]">
            <Button color="indigo" href={`/decks/${deck.id}/study`} className="w-full justify-center">
              Study Now
            </Button>
            <Button outline className="w-full justify-center" onClick={openEditDeck}>
              Edit Deck
            </Button>
            <Button
              color="red"
              className="w-full justify-center ring-2 ring-red-600/70 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950"
              onClick={() => {
                setDeleteDeckError(null);
                setDeleteDeckOpen(true);
              }}
            >
              Delete Deck
            </Button>
          </div>
        </div>
      </header>

      <Divider soft />

      {/* Zone 2 — Card list */}
      <section aria-labelledby="deck-cards-heading" className="space-y-4">
        <Subheading id="deck-cards-heading" level={2}>
          Cards
        </Subheading>
        {cardCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-950/15 bg-zinc-950/[0.02] px-6 py-12 text-center dark:border-white/15 dark:bg-white/[0.03]">
            <Text className="text-zinc-600 dark:text-zinc-300">No cards yet.</Text>
            <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Add your first card using the form below.
            </Text>
          </div>
        ) : (
          <Table bleed dense>
            <TableHead>
              <TableRow>
                <TableHeader className="w-14">#</TableHeader>
                <TableHeader>Question or term</TableHeader>
                <TableHeader>Answer or definition</TableHeader>
                <TableHeader className="w-40 text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {deck.cards.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="tabular-nums text-zinc-500 dark:text-zinc-400">{c.position}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-zinc-950 dark:text-white">
                    {c.front}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-zinc-700 dark:text-zinc-200">
                    {c.back}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex flex-wrap justify-end gap-2">
                      <Button plain className="text-sm" onClick={() => openEditCard(c)}>
                        Edit
                      </Button>
                      <Button
                        plain
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => {
                          setDeleteCardError(null);
                          setDeleteCardRow(c);
                        }}
                      >
                        Delete
                      </Button>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <Divider soft />

      {/* Zone 3 — Add card (always visible) */}
      <section
        aria-labelledby="add-card-heading"
        className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-zinc-950/5 sm:p-6 dark:bg-zinc-950/40 dark:ring-white/10"
      >
        <div className="space-y-6">
          <div>
            <Subheading id="add-card-heading" level={2}>
              Add card
            </Subheading>
            <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              New cards are appended to the end of this deck.
            </Text>
          </div>
          {addError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {addError}
            </div>
          ) : null}
          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <Label>Question or term</Label>
              <Textarea
                name="new_card_front"
                rows={3}
                resizable={false}
                value={newFront}
                onChange={(e) => {
                  setNewFront(e.target.value);
                  if (addError) setAddError(null);
                }}
                disabled={addBusy}
              />
            </Field>
            <Field>
              <Label>Answer or definition</Label>
              <Textarea
                name="new_card_back"
                rows={3}
                resizable={false}
                value={newBack}
                onChange={(e) => {
                  setNewBack(e.target.value);
                  if (addError) setAddError(null);
                }}
                disabled={addBusy}
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button color="indigo" disabled={addBusy} onClick={() => void handleAddCard()}>
              {addBusy ? "Adding…" : "Add Card"}
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={editDeckOpen} onClose={setEditDeckOpen} size="md">
        <DialogTitle>Edit deck</DialogTitle>
        <DialogDescription>Update how this deck appears in your library.</DialogDescription>
        <DialogBody>
          <div className="space-y-6">
            {deckFormError ? (
              <div
                role="alert"
                className="rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                {deckFormError}
              </div>
            ) : null}
            <Field>
              <Label>Title</Label>
              <Input value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)} disabled={deckSaving} />
            </Field>
            <Field>
              <Label>Description</Label>
              <Description>Optional.</Description>
              <Textarea
                rows={3}
                resizable={false}
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                disabled={deckSaving}
              />
            </Field>
            <SwitchField>
              <Label>Public</Label>
              <Description>Visible to others when sharing is enabled.</Description>
              <Switch color="indigo" checked={deckPublic} onChange={setDeckPublic} disabled={deckSaving} />
            </SwitchField>
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain disabled={deckSaving} onClick={() => setEditDeckOpen(false)}>
            Cancel
          </Button>
          <Button color="indigo" disabled={deckSaving} onClick={() => void handleSaveDeck()}>
            {deckSaving ? "Saving…" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDeckOpen} onClose={setDeleteDeckOpen} size="sm">
        <DialogTitle>Delete this deck?</DialogTitle>
        <DialogDescription>
          Permanently delete <span className="font-semibold text-zinc-950 dark:text-white">&quot;{deck.title}&quot;</span>{" "}
          and all of its cards. This cannot be undone.
        </DialogDescription>
        {deleteDeckError ? (
          <DialogBody>
            <div
              role="alert"
              className="rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {deleteDeckError}
            </div>
          </DialogBody>
        ) : null}
        <DialogActions>
          <Button plain disabled={deleteDeckBusy} onClick={() => setDeleteDeckOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            disabled={deleteDeckBusy}
            className="ring-2 ring-red-600/80 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950"
            onClick={() => void handleDeleteDeck()}
          >
            {deleteDeckBusy ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editCard} onClose={() => setEditCard(null)} size="lg">
        <DialogTitle>Edit card</DialogTitle>
        <DialogDescription>Update the front and back of this card.</DialogDescription>
        <DialogBody>
          <div className="grid gap-6 sm:grid-cols-2">
            {editCardError ? (
              <div
                role="alert"
                className="sm:col-span-2 rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                {editCardError}
              </div>
            ) : null}
            <Field>
              <Label>Question or term</Label>
              <Textarea
                rows={4}
                resizable={false}
                value={editFront}
                onChange={(e) => setEditFront(e.target.value)}
                disabled={editCardBusy}
              />
            </Field>
            <Field>
              <Label>Answer or definition</Label>
              <Textarea
                rows={4}
                resizable={false}
                value={editBack}
                onChange={(e) => setEditBack(e.target.value)}
                disabled={editCardBusy}
              />
            </Field>
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain disabled={editCardBusy} onClick={() => setEditCard(null)}>
            Cancel
          </Button>
          <Button color="indigo" disabled={editCardBusy} onClick={() => void handleSaveCard()}>
            {editCardBusy ? "Saving…" : "Save card"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteCardRow} onClose={() => setDeleteCardRow(null)} size="sm">
        <DialogTitle>Delete card?</DialogTitle>
        <DialogDescription>
          Remove this card from the deck. Position numbers may have gaps afterward; order is still by stored
          position.
        </DialogDescription>
        {deleteCardError ? (
          <DialogBody>
            <div
              role="alert"
              className="rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {deleteCardError}
            </div>
          </DialogBody>
        ) : null}
        <DialogActions>
          <Button plain disabled={deleteCardBusy} onClick={() => setDeleteCardRow(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            disabled={deleteCardBusy}
            className="ring-2 ring-red-600/80 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950"
            onClick={() => void handleConfirmDeleteCard()}
          >
            {deleteCardBusy ? "Deleting…" : "Delete card"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
