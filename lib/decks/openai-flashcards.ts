import "server-only";

export type FlashcardDraft = {
  front: string;
  back: string;
};

const MAX_CARDS = 40;
const MAX_SIDE_LEN = 4000;

function clampCards(input: FlashcardDraft[]): FlashcardDraft[] {
  return input
    .filter((c) => c.front.trim().length > 0 && c.back.trim().length > 0)
    .slice(0, MAX_CARDS)
    .map((c) => ({
      front: c.front.trim().slice(0, MAX_SIDE_LEN),
      back: c.back.trim().slice(0, MAX_SIDE_LEN),
    }));
}

function parseCardsPayload(raw: unknown): FlashcardDraft[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const cards = obj.cards;
  if (!Array.isArray(cards)) return [];
  const out: FlashcardDraft[] = [];
  for (const item of cards) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const front = typeof row.front === "string" ? row.front : "";
    const back = typeof row.back === "string" ? row.back : "";
    out.push({ front, back });
  }
  return clampCards(out);
}

export async function generateFlashcardsWithOpenAI(params: {
  apiKey: string;
  prompt: string;
  previousCards?: FlashcardDraft[];
}): Promise<{ cards: FlashcardDraft[] } | { error: string }> {
  const promptTrim = params.prompt.trim();
  if (!promptTrim) {
    return { error: "Prompt is required." };
  }

  const system =
    params.previousCards && params.previousCards.length > 0
      ? `You revise flashcards for study apps. Return ONLY valid JSON with shape {"cards":[{"front":"string","back":"string"},...]}.

Rules:
- Produce a complete revised list (do not describe changes in prose outside JSON).
- Aim for 12–24 cards unless the user asks for a different count.
- Front: short prompt, term, or question. Back: clear, accurate answer.
- Keep each side concise (typically one or two sentences).

You will be given the user's latest instructions and their current cards as JSON.`
      : `You generate flashcards for study apps. Return ONLY valid JSON with shape {"cards":[{"front":"string","back":"string"},...]}.

Rules:
- Aim for 12–20 cards unless the user specifies otherwise.
- Front: short prompt, term, or question. Back: clear, accurate answer.
- Stay faithful to the user's topic and difficulty level.
- No markdown, no code fences—JSON only.`;

  const userContent =
    params.previousCards && params.previousCards.length > 0
      ? `User instructions:\n${promptTrim}\n\nCurrent cards (JSON):\n${JSON.stringify({ cards: params.previousCards })}`
      : `Topic / instructions:\n${promptTrim}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { error: text || `OpenAI request failed (${res.status}).` };
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    return { error: "OpenAI returned an empty response." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    return { error: "Could not parse flashcards JSON from the model." };
  }

  const cards = parseCardsPayload(parsed);
  if (cards.length === 0) {
    return { error: "The model returned no usable flashcards. Try a clearer prompt." };
  }

  return { cards };
}
