import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import LegalDocumentShell from "@/components/legal/legal-document-shell";
import { LegalMarkdown } from "@/components/legal/legal-markdown";
import { buildWebsiteSocialMetadata } from "@/lib/social-preview";

const TITLE = "Terms of Service | GoGoCash";
const DESCRIPTION =
  "GoGoCash Terms of Service — rules for using GoGoCash platforms, accounts, and the cashback program.";

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

/** Same legal text as Terms of Use; alternate URL for SEO and ads compliance. */
export default function TermsOfServicePage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), "content/legal/term-of-use.md"),
    "utf8",
  );

  return (
    <LegalDocumentShell title="Terms of Service" effectiveDate="15 July 2026">
      <LegalMarkdown content={content} />
    </LegalDocumentShell>
  );
}
