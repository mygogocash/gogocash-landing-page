const MONTH_NUMBERS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

/** Best-effort ISO date (YYYY-MM-DD) for Article / Open Graph from display strings like "March 22, 2026". */
export function learnArticleDateIso(display: string): string | undefined {
  const m = display.trim().match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (m) {
    const month = MONTH_NUMBERS[m[1].toLowerCase()];
    if (month) {
      return `${m[3]}-${month}-${m[2].padStart(2, "0")}`;
    }
  }

  const t = Date.parse(display);
  if (Number.isNaN(t)) return undefined;
  return new Date(t).toISOString().slice(0, 10);
}
