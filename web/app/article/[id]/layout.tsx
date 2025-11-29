import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Intelligence Report",
  description: "Detailed analysis and actionable insights about this cybersecurity threat. AI-summarized with fact-checking and recommended actions.",
  openGraph: {
    title: "Security Intelligence Report | CyberShepherd",
    description: "In-depth cybersecurity threat analysis with AI-powered insights and recommended actions.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security Intelligence Report | CyberShepherd",
    description: "In-depth cybersecurity threat analysis with AI-powered insights and recommended actions.",
  },
};

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

