import { NextResponse } from "next/server";
import { searchGameData } from "@/lib/data";
import type { SearchIndexEntry } from "@/types/game";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const kindParam = searchParams.get("kind") ?? "";
  const kinds: SearchIndexEntry["kind"][] = ["character", "weapon", "pet", "loadout"];

  const kind = kinds.includes(kindParam as SearchIndexEntry["kind"])
    ? (kindParam as SearchIndexEntry["kind"])
    : null;

  const results = await searchGameData(q, { kind, limit: 50 });
  return NextResponse.json(
    { query: q, count: results.length, results },
    { headers: { "Cache-Control": "no-store" } },
  );
}
