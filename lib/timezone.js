import { find } from "geo-tz/all";
import { DateTime } from "luxon";


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