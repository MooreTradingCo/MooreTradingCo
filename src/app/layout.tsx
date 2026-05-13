import type { Metadata } from "next";
import { Caveat, DM_Sans, Fraunces } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mooretradingco.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Moore Trading Co. — Small-batch pantry stuff that makes food taste better",
    template: "%s | Moore Trading Co.",
  },
  description:
    "We make small-batch pantry stuff — seasonings, sauces, salts, chili crisp and whatever's next — that makes everything else taste like it tried harder.",
  openGraph: {
    title: "Moore Trading Co.",
    description:
      "Small-batch pantry stuff that makes food taste better. Hand-blended, never mass-produced.",
    url: siteUrl,
    siteName: "Moore Trading Co.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const cfToken = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${caveat.variable}`}
    >
      <body>
        {children}
        {modal}
        <Analytics />
        {cfToken ? (
          <Script
            strategy="afterInteractive"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${cfToken}"}`}
          />
        ) : null}
      </body>
    </html>
  );
}
