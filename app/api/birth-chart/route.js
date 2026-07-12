import { NextResponse } from "next/server";
import { calculateBirthChart } from "@/lib/astrology";
import { geocodeLocation } from "@/lib/geocode";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      year, month, day, hour, minute, location,
      latitude: providedLat, longitude: providedLng, displayName: providedName,
    } = body;

    if (
      year === undefined || month === undefined || day === undefined ||
      hour === undefined || minute === undefined || !location
    ) {
      return NextResponse.json(
        { error: "Missing required fields. Please provide year, month, day, hour, minute, and location." },
        { status: 400 }
      );
    }

    const y = Number(year);
    const mo = Number(month);
    const d = Number(day);
    const h = Number(hour);
    const mi = Number(minute);

    if (
      !Number.isInteger(mo) || mo < 1 || mo > 12 ||
      !Number.isInteger(d) || d < 1 || d > 31 ||
      !Number.isInteger(h) || h < 0 || h > 23 ||
      !Number.isInteger(mi) || mi < 0 || mi > 59
    ) {
      return NextResponse.json(
        { error: "That date or time doesn't look valid. Please double-check it." },
        { status: 400 }
      );
    }


    let latitude, longitude, displayName;
    try {
      if (providedLat !== undefined && providedLng !== undefined) {
        latitude = Number(providedLat);
        longitude = Number(providedLng);
        displayName = providedName || location;
      } else {
        ({ latitude, longitude, displayName } = await geocodeLocation(location));
      }
    } catch (err) {
      return NextResponse.json(
        { error: `Location lookup failed: ${err.message}` },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(latitude) || Number.isNaN(longitude) ||
      latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
    ) {
      return NextResponse.json(
        { error: "The resolved location's coordinates look invalid. Please try a different search." },
        { status: 400 }
      );
    }

    let chart, timezone;
    try {
      ({ chart, timezone } = calculateBirthChart({
        year: y, month: mo, day: d, hour: h, minute: mi, latitude, longitude,
      }));
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: "Something went wrong calculating the chart. Please try a different date or location." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      location: { latitude, longitude, displayName, timezone },
      chart,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Something went wrong calculating the chart." },
      { status: 500 }
    );
  }
}