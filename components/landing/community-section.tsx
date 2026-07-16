import SectionBadge from "@/components/section-badge";
import AnimateOnScroll from "@/components/animate-on-scroll";
import CommunitySocialLinks from "@/components/community-social-links";
import { uiSectionTitle } from "@/lib/ui-classes";

export type CommunitySectionCopy = {
  badge: string;
  title: string;
  desc: string;
};

const ENGLISH_COMMUNITY_COPY: CommunitySectionCopy = {
  badge: "Community",
  title: "Join the GoGoCash community",
  desc: "Tips, drops, and support from the team and other savers — pick your channel.",
};

export default function CommunitySection({
  copy = ENGLISH_COMMUNITY_COPY,
}: {
  copy?: CommunitySectionCopy;
}) {
  return (
    <section id="community" className="scroll-mt-28 py-16 md:py-24">
      <div className="mx-auto min-w-0 max-w-site px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="flex flex-col items-center text-center">
            <SectionBadge label={copy.badge} />
            <h2 className={`mt-6 ${uiSectionTitle}`}>
              {copy.title}
            </h2>
            <p className="mt-4 max-w-xl text-base text-gray-500">
              {copy.desc}
            </p>
          </div>
        </AnimateOnScroll>

        <CommunitySocialLinks />
      </div>
    </section>
  );
}
