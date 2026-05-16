import { NextResponse } from "next/server";

import { generateFlashcardsWithOpenAI } from "@/lib/decks/openai-flashcards";

export const runtime = "nodejs";

type Body = {
  prompt?: unknown;
  previousCards?: unknown;
};

export async function POST(req: Request) {
  const apiKey = process.env.OPEN_AI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPEN_AI_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  let previousCards:
    | { front: string; back: string }[]
    | undefined;

  if (Array.isArray(body.previousCards)) {
    previousCards = [];
    for (const row of body.previousCards) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const front = typeof r.front === "string" ? r.front : "";
      const back = typeof r.back === "string" ? r.back : "";
      previousCards.push({ front, back });
    }
    if (previousCards.length === 0) previousCards = undefined;
  }

  const result = await generateFlashcardsWithOpenAI({
    apiKey,
    prompt,
    previousCards,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ cards: result.cards });
}
