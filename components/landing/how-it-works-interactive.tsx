"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, CheckCircle2 } from "@/components/icons";
import { logHowItWorksTab } from "@/lib/analytics-client";
import { uiCtaPrimarySurface } from "@/lib/ui-classes";
import {
  twCtaPrimaryMotion,
  twFocusRingPrimary,
  twPressSm,
  twTransitionButton,
} from "@/lib/motion-styles";
import { ResponsiveMarketingPicture } from "@/components/responsive-marketing-picture";
import { howItWorksIllustrationCandidates } from "@/lib/how-it-works-illustrations";

export type HowItWorksStep = {
  summary: string;
  title: string;
  desc: string;
  bullets: readonly string[];
  illustrationSrc?: string;
  illustrationAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type HowItWorksInteractiveProps = {
  steps: readonly HowItWorksStep[];
};

export default function HowItWorksInteractive({
  steps,
}: HowItWorksInteractiveProps) {
  const [active, setActive] = useState(0);
  const reactId = useId().replace(/:/g, "");
  const tabPrefix = `howit-tab-${reactId}`;
  const panelId = `howit-panel-${reactId}`;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const block = steps[active];
  const hasIllustration = Boolean(block.illustrationSrc);

  const activateTab = (index: number) => {
    const step = steps[index];
    if (!step) return;
    setActive(index);
    logHowItWorksTab(index, step.summary);
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % steps.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + steps.length) % steps.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = steps.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    activateTab(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <>
      <div
        className="mt-10 flex max-w-full flex-nowrap items-center justify-center gap-2 overflow-x-auto overflow-y-hidden pb-1 [-webkit-overflow-scrolling:touch] sm:gap-3"
        role="tablist"
        aria-label="How it works steps"
      >
        {steps.map((step, i) => {
          const selected = active === i;
          return (
            <button
              ref={(element) => {
                tabRefs.current[i] = element;
              }}
              key={step.summary}
              type="button"
              role="tab"
              id={`${tabPrefix}-${i}`}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => activateTab(i)}
              onKeyDown={(event) => handleTabKeyDown(event, i)}
              className={`inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium shadow-sm sm:px-5 sm:text-sm ${twTransitionButton} ${twPressSm} ${twFocusRingPrimary} md:text-base ${
                selected
                  ? "border-primary bg-surface-green text-primary"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:text-primary"
              }`}
            >
              {step.summary}
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={`${tabPrefix}-${active}`}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-6 shadow-sm sm:px-6 sm:py-8 md:px-10 md:py-12 lg:px-14 lg:py-14"
        >
            <div
              key={active}
              className={`animate-tab-panel-enter motion-reduce:animate-none ${
                hasIllustration
                  ? "grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12"
                  : "grid gap-8"
              }`}
            >
              <div className="flex min-w-0 gap-4 md:gap-10">
                <span
                  className="shrink-0 pt-0.5 text-3xl font-bold tabular-nums leading-none text-primary md:w-12 md:pt-1 md:text-right md:text-4xl"
                  aria-hidden
                >
                  {active + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 md:text-xl lg:text-2xl">
                    {block.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-gray-600">
                    {block.desc}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {block.bullets.map((line) => (
                      <li
                        key={line}
                        className="flex gap-2 text-sm text-gray-600 md:text-base"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  {block.ctaLabel && block.ctaHref ? (
                    <a
                      href={block.ctaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 px-6 py-3 text-sm sm:w-auto ${uiCtaPrimarySurface} ${twCtaPrimaryMotion}`}
                    >
                      {block.ctaLabel}
                      <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-button ease-standard group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </a>
                  ) : null}
                </div>
              </div>

              {hasIllustration && block.illustrationSrc ? (
                <div className="flex min-h-0 items-center justify-center lg:justify-end">
                  <ResponsiveMarketingPicture
                    fallback={block.illustrationSrc}
                    avif={howItWorksIllustrationCandidates(
                      block.illustrationSrc,
                      "avif",
                    )}
                    webp={howItWorksIllustrationCandidates(
                      block.illustrationSrc,
                      "webp",
                    )}
                    alt={
                      block.illustrationAlt ??
                      `${block.title} — step illustration`
                    }
                    width={1024}
                    height={1024}
                    className="h-auto w-full max-w-lg object-contain max-h-[min(28rem,50vh)]"
                    sizes="(max-width: 1024px) 100vw, 40rem"
                  />
                </div>
              ) : null}
            </div>
        </div>
      </div>
    </>
  );
}
