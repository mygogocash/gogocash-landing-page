import AnimateOnScroll from "@/components/animate-on-scroll";
import SectionBadge from "@/components/section-badge";
import LaunchAppLink from "@/components/launch-app-link";
import { ArrowUpRight, Gift, Target, TrendingUp, Trophy } from "@/components/icons";
import { twCtaPrimaryMotion } from "@/lib/motion-styles";
import { uiCtaPrimarySurface, uiSectionTitleLg } from "@/lib/ui-classes";
import { WEB_APP_QUEST_HREF } from "@/lib/destinations";
import type { LocaleHomeQuestsCopy } from "@/lib/locale-home-copy";

const QUEST_ICONS = [TrendingUp, Target, Gift] as const;

const EN_QUESTS_COPY = {
  badge: "Quests",
  title: "Turn everyday shopping into bonus cashback",
  intro:
    "Quests are optional challenges matched to how you shop. Complete them to stack extra cashback on top of your usual rate — real money, no points or guesswork.",
  cards: [
    {
      title: "Spending streaks",
      body: "Shop a few times within a window and unlock a cashback boost on top of the rate you already earn.",
    },
    {
      title: "Category challenges",
      body: "Earn extra in a featured category — travel, electronics, or fashion — whenever a quest is live.",
    },
    {
      title: "Seasonal boosts",
      body: "Limited-time multipliers during big sales and campaigns, so your busiest shopping moments pay back more.",
    },
  ],
  stacking:
    "Quests stack with your regular cashback — every completed quest is extra on top.",
  cta: "See live quests in the app",
} satisfies LocaleHomeQuestsCopy;

type QuestsSectionProps = {
  copy?: LocaleHomeQuestsCopy;
};

/**
 * Dedicated Quests section (#15). Explains the quest feature with example types
 * and how it stacks with base cashback. Content stays aligned with existing
 * quest copy — no invented mechanics or numbers.
 */
export default function QuestsSection({
  copy = EN_QUESTS_COPY,
}: QuestsSectionProps) {
  return (
    <section id="quests" className="scroll-mt-28 py-16 md:py-24">
      <div className="mx-auto min-w-0 max-w-site px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="flex flex-col items-center text-center">
            <SectionBadge
              icon={
                <Trophy
                  aria-hidden="true"
                  focusable="false"
                  className="h-4 w-4"
                />
              }
              label={copy.badge}
            />
            <h2 className={`mt-6 ${uiSectionTitleLg}`}>{copy.title}</h2>
            <p className="mt-4 max-w-2xl text-base text-gray-500">
              {copy.intro}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:gap-6">
          {copy.cards.map((quest, index) => {
            const Icon = QUEST_ICONS[index];
            return (
              <AnimateOnScroll key={quest.title} delay={(index + 1) * 100}>
                <div className="h-full rounded-3xl border border-gray-100 bg-white p-8 shadow-sm lg:p-10">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-green text-primary">
                    <Icon
                      aria-hidden="true"
                      focusable="false"
                      className="h-6 w-6"
                    />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-gray-800">
                    {quest.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    {quest.body}
                  </p>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>

        <AnimateOnScroll delay={400}>
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-gray-500">
              {copy.stacking}
            </p>
            <LaunchAppLink
              surface="quests"
              desktopTarget={{ kind: "web", href: WEB_APP_QUEST_HREF }}
              mobileTarget={{ kind: "web", href: WEB_APP_QUEST_HREF }}
              className={`group inline-flex min-h-11 items-center justify-center gap-2 px-6 py-3 text-sm ${uiCtaPrimarySurface} ${twCtaPrimaryMotion}`}
            >
              {copy.cta}
              <ArrowUpRight
                aria-hidden="true"
                focusable="false"
                className="h-4 w-4 shrink-0 transition-transform duration-button ease-standard group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </LaunchAppLink>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
