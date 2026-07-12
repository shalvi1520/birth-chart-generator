import { NextResponse } from "next/server";
import { calculateBirthChart } from "@/lib/astrology";

export async function GET() {
  const { horoscope, timezone } = calculateBirthChart({
    year: 1990,
    month: 6,   
    day: 15,
    hour: 14,
    minute: 30,
    latitude: 40.7128,   
    longitude: -74.0060,
  });

  return NextResponse.json({
    timezone,
    bodies: horoscope.CelestialBodies,
    houses: horoscope.Houses,
    angles: horoscope.Angles,
    aspects: horoscope.Aspects,
  });
}