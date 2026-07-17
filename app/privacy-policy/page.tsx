import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import LegalDocumentShell from "@/components/legal/legal-document-shell";
import { LegalMarkdown } from "@/components/legal/legal-markdown";
import { buildWebsiteSocialMetadata } from "@/lib/social-preview";

const TITLE = "Privacy Policy | GoGoCash";
const DESCRIPTION =
  "How GoGoCash (GOGO HOLDING Thailand Limited Partnership) collects, uses, and protects your personal data under Thailand's PDPA when you use our Services.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy-policy" },
  ...buildWebsiteSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    url: "/privacy-policy",
  }),
};

export default function PrivacyPolicyPage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), "content/legal/privacy-policy.md"),
    "utf8",
  );

  return (
    <LegalDocumentShell title="Privacy Policy" effectiveDate="15 July 2026">
      <LegalMarkdown content={content} />
    </LegalDocumentShell>
  );
}
