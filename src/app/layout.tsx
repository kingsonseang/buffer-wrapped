import type { Metadata } from "next";
import { Inter, Caveat, Figtree, Google_Sans_Flex } from "next/font/google";

import { cn } from "#/lib/utils";

import "#/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
});

export const metadata: Metadata = {
  title: "Your Year on Buffer ✨ | Wrapped",
  description:
    "Discover your social media highlights, top-performing posts, and audience growth milestones this year.",
  openGraph: {
    title: "Your Year on Buffer ✨",
    description:
      "I analyzed my social scheduling and audience metrics for the year. See how your channels stack up!",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Buffer Wrapped - Your Year in Review",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Year on Buffer ✨",
    description: "Track your top posts, scheduling streaks, and growth milestones.",
  },
  metadataBase: new URL("https://buffer-wrapped.vercel.app"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        googleSansFlex.variable,
        inter.variable,
        caveat.variable,
        figtree.variable,
        "font-sans",
      )}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
