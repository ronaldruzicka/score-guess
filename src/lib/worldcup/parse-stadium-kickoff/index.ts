import { Temporal } from "@js-temporal/polyfill";

import { STADIUM_TIMEZONE_BY_ID } from "../stadium-timezones";

// Matches "06/11/2026 13:00" (MM/DD/YYYY HH:mm, stadium-local time).
const LOCAL_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/u;

/**
 * Converts the API's stadium-local kickoff string to a UTC instant using the
 * venue's IANA time zone (see {@link STADIUM_TIMEZONE_BY_ID}).
 */
export function parseStadiumKickoff(
  localDate: string,
  stadiumId: number,
): Date {
  const timeZone = STADIUM_TIMEZONE_BY_ID[stadiumId];

  if (!timeZone) {
    throw new Error(`Unknown stadium timezone for id ${stadiumId}`);
  }

  const match = LOCAL_DATE_PATTERN.exec(localDate);

  if (!match) {
    throw new Error(`Unexpected match date format: ${localDate}`);
  }

  const [, month, day, year, hours, minutes] = match;
  const isoLocal = `${year}-${month}-${day}T${hours}:${minutes}:00`;

  try {
    const kickoff = Temporal.ZonedDateTime.from(`${isoLocal}[${timeZone}]`);

    return new Date(kickoff.epochMilliseconds);
  } catch {
    throw new Error(
      `Invalid kickoff time ${localDate} for timezone ${timeZone}`,
    );
  }
}
