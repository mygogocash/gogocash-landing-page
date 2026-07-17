const MONTH_NUMBER = new Map(
  [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].map((month, index) => [month.toLowerCase(), index + 1]),
);

function isoCalendarDate(
  year: number,
  month: number,
  day: number,
): string | undefined {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Strict ISO calendar date for Article/Open Graph, independent of build timezone. */
export function learnArticleDateIso(display: string): string | undefined {
  const value = display.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) {
    return isoCalendarDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const monthFirst = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(value);
  if (monthFirst) {
    const month = MONTH_NUMBER.get(monthFirst[1].toLowerCase());
    if (!month) return undefined;
    return isoCalendarDate(Number(monthFirst[3]), month, Number(monthFirst[2]));
  }

  const dayFirst = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(value);
  if (dayFirst) {
    const month = MONTH_NUMBER.get(dayFirst[2].toLowerCase());
    if (!month) return undefined;
    return isoCalendarDate(Number(dayFirst[3]), month, Number(dayFirst[1]));
  }

  return undefined;
}
