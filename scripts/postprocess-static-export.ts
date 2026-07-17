import fs from "node:fs";
import path from "node:path";
import { documentLanguageForPathname } from "../lib/document-language";

const outDir = path.join(process.cwd(), "out");

function walkHtmlFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkHtmlFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".html") ? [absolute] : [];
  });
}

function pathnameForExportedHtml(filePath: string): string {
  const relative = path.relative(outDir, filePath).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"/index.html".length)}`;
  }
  return `/${relative.slice(0, -".html".length)}`;
}

if (!fs.existsSync(outDir)) {
  throw new Error(`Static export directory not found: ${outDir}`);
}

let updated = 0;
for (const filePath of walkHtmlFiles(outDir)) {
  const pathname = pathnameForExportedHtml(filePath);
  const language = documentLanguageForPathname(pathname);
  const html = fs.readFileSync(filePath, "utf8");
  const next = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${language}"`);
  if (next !== html) {
    fs.writeFileSync(filePath, next);
    updated += 1;
  }
}

console.log(`Updated document language in ${updated} static HTML files.`);
