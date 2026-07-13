import { find } from "geo-tz/all";
import { DateTime } from "luxon";
import fs from "fs";
import path from "path";

// TEMPORARY diagnostic — logs the real runtime paths so we can find where
// geo-tz's data actually lives on Vercel, instead of guessing again.
try {
  console.log("=== GEO_TZ DEBUG ===");
  console.log("process.cwd():", process.cwd());
  console.log("__dirname:", __dirname);
  console.log("GEO_TZ_DATA_PATH env:", process.env.GEO_TZ_DATA_PATH);

  const candidates = [
    path.join(process.cwd(), "node_modules/geo-tz/data"),
    "/var/task/node_modules/geo-tz/data",
    path.join(process.cwd(), ".next/server/node_modules/geo-tz/data"),
  ];

  for (const p of candidates) {
    try {
      const exists = fs.existsSync(p);
      console.log(`Checking ${p} -> exists: ${exists}`);
      if (exists) {
        console.log(`  contents:`, fs.readdirSync(p).slice(0, 5));
      }
    } catch (e) {
      console.log(`  error checking ${p}:`, e.message);
    }
  }
  console.log("=== END DEBUG ===");
} catch (e) {
  console.log("Debug block itself failed:", e.message);
}


export function getUTCDateTime({ year, month, day, hour, minute, latitude, longitude }) {
  const timezones = find(latitude, longitude);
  const timezone = timezones[0];

  const local = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: timezone }
  );

  const utc = local.toUTC();

  return {
    timezone,
    utc: {
      year: utc.year,
      month: utc.month - 1, 
      day: utc.day,
      hour: utc.hour,
      minute: utc.minute,
    },
    isoLocal: local.toISO(),
    isoUTC: utc.toISO(),
  };
}