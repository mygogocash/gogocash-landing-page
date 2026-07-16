const PATH_DOCUMENT_LANGUAGES = [
  { root: "/th", language: "th" },
  { root: "/ja", language: "ja" },
  { root: "/cn", language: "zh-Hans" },
  { root: "/tw", language: "zh-Hant" },
  { root: "/id", language: "id" },
] as const;

/** Resolve the language of rendered page content from its canonical pathname. */
export function documentLanguageForPathname(pathname: string): string {
  for (const entry of PATH_DOCUMENT_LANGUAGES) {
    if (pathname === entry.root || pathname.startsWith(`${entry.root}/`)) {
      return entry.language;
    }
  }
  return "en";
}
