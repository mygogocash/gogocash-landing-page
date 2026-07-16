import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import LegalDocumentShell from "@/components/legal/legal-document-shell";
import { LegalMarkdown } from "@/components/legal/legal-markdown";
import { buildWebsiteSocialMetadata } from "@/lib/social-preview";

const TITLE = "Terms of Use | GoGoCash";
const DESCRIPTION =
  "GoGoCash Terms of Use — rules for using GoGoCash Platforms, accounts, and the Cashback Program.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/term-of-use" },
  ...buildWebsiteSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    url: "/term-of-use",
  }),
};

export default function TermsOfUsePage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), "content/legal/term-of-use.md"),
    "utf8",
  );

  return (
    <LegalDocumentShell title="Terms of Use" effectiveDate="15 July 2026">
      <LegalMarkdown content={content} />
    </LegalDocumentShell>
  );
}
