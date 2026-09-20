import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Portfolio coming soon.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio · maggie",
    description: "Portfolio coming soon.",
    url: "/portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio · maggie",
    description: "Portfolio coming soon.",
  },
};

export default function PortfolioPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 py-12 text-foreground">
      <h1 className="text-center text-4xl font-medium tracking-tight sm:text-5xl">
        Coming soon
      </h1>
    </main>
  );
}
