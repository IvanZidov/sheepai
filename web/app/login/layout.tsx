import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to CyberShepherd to access your personalized security dashboard and get cybersecurity news filtered for your tech stack.",
  openGraph: {
    title: "Sign In | CyberShepherd",
    description: "Sign in to access your personalized security intelligence dashboard.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

