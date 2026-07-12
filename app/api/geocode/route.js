import { NextResponse } from "next/server";
import { searchLocations } from "@/lib/geocode";

export async function GET(request) {
  const q = new URL(request.url).searchParams.get("q") || "";

  try {
    const results = await searchLocations(q);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Search failed" },
      { status: 500 }
    );
  }
}