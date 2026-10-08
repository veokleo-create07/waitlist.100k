import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clonao — Personal Brand AI for LinkedIn",
  description: "Clonao analyzes your personal brand and tells you what to focus on next.",
  icons: { icon: "/clonao-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<Analytics /></body></html>;
}
