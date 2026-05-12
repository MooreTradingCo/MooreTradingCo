import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mooretradingco.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Moore Trading Co. — Small-batch seasonings, sauces & salts",
    template: "%s | Moore Trading Co.",
  },
  description:
    "Moore Trading Co. crafts small-batch seasonings, finishing salts, sauces, and prepared foods. Hand-blended, never mass-produced.",
  openGraph: {
    title: "Moore Trading Co.",
    description:
      "Small-batch seasonings, sauces, salts, and prepared foods. Shipped fresh.",
    url: siteUrl,
    siteName: "Moore Trading Co.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "facebook-domain-verification": "v98nje9132eyso9nx6wymyr0fb8gng",
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
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
