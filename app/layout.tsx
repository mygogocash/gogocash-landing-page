import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { LineTagScripts } from "@/components/line-tag-scripts";
import { AppClientProviders } from "@/components/app-client-providers";
import SchemaMarkup from "@/components/schema-markup";
import {
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  SOCIAL_PREVIEW_DESCRIPTION,
  SOCIAL_PREVIEW_TITLE,
} from "@/lib/social-preview";
import { siteOrigin } from "@/lib/site";
import { publicAssetUrl } from "@/lib/public-asset-url";
import "./globals.css";

function metadataBaseUrl(): URL {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined,
    "https://gogocash.co",
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    try {
      return new URL(raw);
    } catch {
      /* try next candidate */
    }
  }
  return new URL("https://gogocash.co");
}

const poppins = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10b981",
  colorScheme: "light",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: SOCIAL_PREVIEW_TITLE,
  description: SOCIAL_PREVIEW_DESCRIPTION,
  keywords: [
    "GoGoCash",
    "cashback",
    "Shopee",
    "Lazada",
    "Agoda",
    "Southeast Asia",
    "shopping rewards",
  ],
  authors: [{ name: "GoGoCash" }],
  creator: "GoGoCash",
  metadataBase: metadataBaseUrl(),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteOrigin(),
    siteName: "GoGoCash",
    title: SOCIAL_PREVIEW_TITLE,
    description: SOCIAL_PREVIEW_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_PREVIEW_TITLE,
    description: SOCIAL_PREVIEW_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={poppins.variable}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var h=location.hostname;if(h.charAt(h.length-1)!==".")return;location.replace(location.protocol+"//"+h.slice(0,-1)+location.pathname+location.search+location.hash);})();`,
          }}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={publicAssetUrl("/apple-touch-icon.png")}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={publicAssetUrl("/favicon-32x32.png")}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={publicAssetUrl("/favicon-16x16.png")}
        />
        <link rel="manifest" href={publicAssetUrl("/site.webmanifest")} />
        <link rel="icon" href={publicAssetUrl("/favicon.ico")} sizes="any" />
        <SchemaMarkup />
      </head>
      <body className="font-sans antialiased bg-white text-gray-800">
        <a
          href="#main-content"
          lang="en"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-primary focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        >
          Skip to main content
        </a>
        <LineTagScripts />
        <AppClientProviders>{children}</AppClientProviders>
      </body>
    </html>
  );
}
