export {
  LINE_MINI_APP_HREF,
  LINE_LOCALIZED_CONTACT_HREF,
  LINE_OFFICIAL_ACCOUNT_HREF,
  WEB_APP_HREF,
  WEB_APP_QUEST_HREF,
} from "@/lib/destinations";

import { LINE_OFFICIAL_ACCOUNT_HREF } from "@/lib/destinations";

export const SOCIAL_ICONS = [
  { label: "X", href: "https://x.com/mygogocash", icon: "X" },
  {
    label: "Discord",
    href: "https://discord.gg/T9aydr2yFd",
    icon: "Discord",
  },
  {
    label: "Telegram",
    href: "https://t.me/GoGoCashOfficialChannel",
    icon: "Telegram",
  },
  {
    label: "Line",
    href: LINE_OFFICIAL_ACCOUNT_HREF,
    icon: "Line",
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@mygogocash",
    icon: "Threads",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/gogocash",
    icon: "LinkedIn",
  },
  { label: "GitHub", href: "https://github.com/mygogocash", icon: "GitHub" },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@mygogocash",
    icon: "YouTube",
  },
] as const;

export type SocialIconName = (typeof SOCIAL_ICONS)[number]["icon"];
