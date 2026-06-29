import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeLegalMarkdown } from "@/lib/legal-markdown-normalize";

export function LegalMarkdown({ content }: { content: string }) {
  return (
    <div className="space-y-4 [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        allowedElements={[
          "a",
          "code",
          "em",
          "h1",
          "h2",
          "h3",
          "h6",
          "hr",
          "li",
          "ol",
          "p",
          "strong",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "ul",
        ]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              className="font-medium text-primary underline-offset-2 hover:underline"
            />
          ),
          code: ({ ...props }) => (
            <code
              {...props}
              className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.9em] text-gray-800"
            />
          ),
          em: ({ ...props }) => <em {...props} className="italic" />,
          // Bilingual legal docs carry a `#` title per language. The page shell
          // already renders the page-level <h1>, so render these as styled <h2>
          // to keep a single document outline while still marking each language.
          h1: ({ ...props }) => (
            <h2
              {...props}
              className="mt-4 scroll-mt-28 text-2xl font-bold tracking-tight text-gray-900"
            />
          ),
          h2: ({ ...props }) => (
            <h2
              {...props}
              className="scroll-mt-28 text-2xl font-semibold tracking-tight text-gray-900"
            />
          ),
          h3: ({ ...props }) => (
            <h3
              {...props}
              className="scroll-mt-24 text-lg font-semibold text-gray-900"
            />
          ),
          h6: ({ ...props }) => (
            <h2
              {...props}
              className="scroll-mt-28 text-base font-semibold tracking-tight text-gray-900"
            />
          ),
          hr: ({ ...props }) => (
            <hr {...props} className="my-8 border-gray-200" />
          ),
          li: ({ ...props }) => (
            <li {...props} className="text-gray-600 marker:text-gray-400" />
          ),
          ol: ({ ...props }) => (
            <ol
              {...props}
              className="list-decimal space-y-2 pl-5 text-gray-600"
            />
          ),
          p: ({ ...props }) => <p {...props} className="text-gray-600" />,
          strong: ({ ...props }) => (
            <strong {...props} className="font-semibold text-gray-800" />
          ),
          // Wrap tables so wide rows scroll within the column instead of
          // forcing horizontal overflow on the page (mobile-overflow e2e guard).
          table: ({ ...props }) => (
            <div className="my-6 w-full overflow-x-auto">
              <table
                {...props}
                className="w-full border-collapse text-left text-sm text-gray-600"
              />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead {...props} className="border-b border-gray-300" />
          ),
          th: ({ ...props }) => (
            <th
              {...props}
              className="px-3 py-2 align-top font-semibold text-gray-800"
            />
          ),
          td: ({ ...props }) => (
            <td
              {...props}
              className="border-t border-gray-200 px-3 py-2 align-top"
            />
          ),
          ul: ({ ...props }) => (
            <ul
              {...props}
              className="list-disc space-y-2 pl-5 text-gray-600"
            />
          ),
        }}
      >
        {normalizeLegalMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
