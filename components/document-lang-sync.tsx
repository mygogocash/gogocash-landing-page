"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { documentLanguageForPathname } from "@/lib/document-language";

/** Keep document language correct after client-side navigation. */
export default function DocumentLangSync() {
  const pathname = usePathname();
  const language = documentLanguageForPathname(pathname);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
