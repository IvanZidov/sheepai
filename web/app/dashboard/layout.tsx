import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personalized cybersecurity dashboard. View threats filtered for your tech stack, adjust alert thresholds, and stay informed about relevant security issues.",
  openGraph: {
    title: "Security Dashboard | CyberShepherd",
    description: "Your personalized cybersecurity intelligence feed, filtered for your tech stack.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

