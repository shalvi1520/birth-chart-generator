import { Origin, Horoscope } from "circular-natal-horoscope-js";
import { getUTCDateTime } from "./timezone";


const PLANET_KEYS = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
  "chiron", "northnode", "southnode",
];


function formatDegreeInSign(decimalDegrees) {
  const deg = ((decimalDegrees % 30) + 30) % 30;
  const degrees = Math.floor(deg);
  const minutes = Math.round((deg - degrees) * 60);
  return { degrees, minutes };
}


function normalizeChart(horoscope) {
  const planets = horoscope.CelestialBodies.all
    .filter((b) => PLANET_KEYS.includes(b.key))
    .map((b) => {
      const abs = b.ChartPosition.Ecliptic.DecimalDegrees;
      const { degrees, minutes } = formatDegreeInSign(abs);
      return {
        key: b.key,
        label: b.label,
        sign: b.Sign.label,
        signKey: b.Sign.key,
        degree: degrees,
        minute: minutes,
        absoluteDegree: abs,
        house: b.House?.id ?? null,
        retrograde: b.isRetrograde ?? false,
      };
    });

  const houses = horoscope.Houses.map((h) => {
    const abs = h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
    const { degrees, minutes } = formatDegreeInSign(abs);
    return {
      id: h.id,
      sign: h.Sign.label,
      signKey: h.Sign.key,
      startDegree: degrees,
      startMinute: minutes,
      absoluteDegree: abs,
    };
  });

  const angles = {};
  horoscope.Angles.all.forEach((a) => {
    const abs = a.ChartPosition.Ecliptic.DecimalDegrees;
    const { degrees, minutes } = formatDegreeInSign(abs);
    angles[a.key] = {
      label: a.label,
      sign: a.Sign.label,
      signKey: a.Sign.key,
      degree: degrees,
      minute: minutes,
      absoluteDegree: abs,
    };
  });

  const relevantKeys = new Set([...PLANET_KEYS, "ascendant", "midheaven"]);
  const aspects = horoscope.Aspects.all
    .filter((a) => relevantKeys.has(a.point1Key) && relevantKeys.has(a.point2Key))
    .map((a) => ({
      point1: a.point1Key,
      point1Label: a.point1Label,
      point2: a.point2Key,
      point2Label: a.point2Label,
      type: a.aspectKey,
      label: a.label,
      orb: Math.round(a.orb * 100) / 100,
    }));

  return { planets, houses, angles, aspects };
}

export function calculateBirthChart({ year, month, day, hour, minute, latitude, longitude }) {
  const { utc, timezone } = getUTCDateTime({
    year, month, day, hour, minute, latitude, longitude,
  });

  const origin = new Origin({
    year: utc.year,
    month: utc.month,
    date: utc.day,
    hour: utc.hour,
    minute: utc.minute,
    latitude,
    longitude,
  });


  const houseSystem = Math.abs(latitude) >= 66.5 ? "whole-sign" : "placidus";

  const horoscope = new Horoscope({
    origin,
    houseSystem,
    zodiac: "tropical",
    aspectPoints: ["bodies", "points", "angles"],
    aspectWithPoints: ["bodies", "points", "angles"],
    aspectTypes: ["major"],
    customOrbs: {},
    language: "en",
  });

  return {
    chart: normalizeChart(horoscope),
    timezone,
  };
}