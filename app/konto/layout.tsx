import type { Metadata } from "next";

// App screen: not useful in search results
export const metadata: Metadata = { title: "Konto", robots: { index: false, follow: true } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
