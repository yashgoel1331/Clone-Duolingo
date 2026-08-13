import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import { ToastProvider } from "@/components/ui/Toast";

import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learn | Duolingo Clone",
  description: "A playful language-learning path with lessons, streaks, and daily quests.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-text">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
