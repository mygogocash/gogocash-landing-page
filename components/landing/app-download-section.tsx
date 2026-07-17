import Image from "next/image";
import SectionBadge from "@/components/section-badge";
import AnimateOnScroll from "@/components/animate-on-scroll";
import { LINE_MINI_APP_HREF, WEB_APP_HREF } from "@/components/social-data";
import { ArrowUpRight } from "@/components/icons";
import {
  twCtaOutlineMotion,
  twDurButton,
  twEaseStandard,
  twFocusRingPrimary,
  twPressSm,
  twTransitionButton,
} from "@/lib/motion-styles";
import { uiCtaOutlineBrand, uiSectionTitle } from "@/lib/ui-classes";
import { publicAssetUrl } from "@/lib/public-asset-url";

export type AppDownloadSectionCopy = {
  badge: string;
  title: string;
  desc: string;
  bullets: readonly string[];
  telegram: string;
  line: string;
  web: string;
  scanLabel: string;
  qrAria: string;
  qrAlt: string;
  qrCaptionBefore: string;
  qrCaptionLink: string;
  qrCaptionAfter: string;
};

const ENGLISH_APP_DOWNLOAD_COPY: AppDownloadSectionCopy = {
  badge: "Launch App",
  title: "Start GoGoCash with your favorite app",
  desc: "Use Telegram or LINE mini apps, or open the web app — same cashback, optimized for small screens.",
  bullets: [
    "Track offers and quests on the go",
    "Get notified when rates spike",
  ],
  telegram: "Telegram Mini App",
  line: "LINE Mini App",
  web: "Open web app",
  scanLabel: "Scan to open",
  qrAria: "Open GoGoCash LINE Mini App (QR code)",
  qrAlt: "QR code to open GoGoCash LINE Mini App",
  qrCaptionBefore: "Opens the",
  qrCaptionLink: "GoGoCash LINE Mini App",
  qrCaptionAfter: ". You can also use Telegram or the web app on the left.",
};

export default function AppDownloadSection({
  copy = ENGLISH_APP_DOWNLOAD_COPY,
}: {
  copy?: AppDownloadSectionCopy;
}) {
  return (
    <section
      id="download-app"
      className="scroll-mt-28 bg-cream py-16 md:py-24"
    >
      <div className="mx-auto min-w-0 max-w-site px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <AnimateOnScroll>
            <div>
              <SectionBadge label={copy.badge} />
              <h2 className={`mt-6 ${uiSectionTitle}`}>
                {copy.title}
              </h2>
              <p className="mt-4 text-base text-gray-500">
                {copy.desc}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                {copy.bullets.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="https://t.me/GoGoCashAppBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0c4a6e] px-6 py-3 text-sm font-normal text-white hover:bg-[#083b59] ${twTransitionButton} ${twPressSm} ${twFocusRingPrimary}`}
                >
                  {copy.telegram}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-button ease-standard group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </a>
                <a
                  href={LINE_MINI_APP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#047857] px-6 py-3 text-sm font-normal text-white hover:bg-[#065f46] ${twTransitionButton} ${twPressSm} ${twFocusRingPrimary}`}
                >
                  {copy.line}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-button ease-standard group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </a>
                <a
                  href={WEB_APP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group inline-flex min-h-11 items-center justify-center gap-2 px-6 py-3 text-sm ${uiCtaOutlineBrand} ${twCtaOutlineMotion}`}
                >
                  {copy.web}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-button ease-standard group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </a>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={150}>
            <div className="mx-auto flex max-w-sm flex-col items-center rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm lg:mx-0 lg:max-w-none">
              <p className="text-sm font-medium text-gray-500">
                {copy.scanLabel}
              </p>
              <a
                href={LINE_MINI_APP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 block rounded-2xl border border-gray-200 bg-white p-2 shadow-inner hover:border-[#06C755]/40 ${twTransitionButton} ${twFocusRingPrimary}`}
                aria-label={copy.qrAria}
              >
                <Image
                  src={publicAssetUrl("/images/qr-gogocash-line-miniapp.webp")}
                  alt={copy.qrAlt}
                  width={224}
                  height={224}
                  className="h-56 w-56 rounded-xl object-contain md:h-64 md:w-64"
                  priority={false}
                />
              </a>
              <p className="mt-4 text-xs text-gray-500">
                {copy.qrCaptionBefore}{" "}
                <a
                  href={LINE_MINI_APP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-medium text-primary underline-offset-2 hover:underline ${twDurButton} ${twEaseStandard} transition-colors motion-reduce:duration-micro`}
                >
                  {copy.qrCaptionLink}
                </a>
                {copy.qrCaptionAfter}
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
