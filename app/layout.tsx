import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwimMeet – Live Swim Results",
  description:
    "Search swimmers and meet events. View real-time swim meet results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-lg font-bold text-blue-600 tracking-tight shrink-0"
            >
              🏊 SwimMeet
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/meets"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Live Meets
              </Link>
              <Link
                href="/search"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Search
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white mt-auto">
          <div className="max-w-4xl mx-auto px-4 py-4 text-xs text-slate-400 text-center">
            Data sourced from{" "}
            <a
              href="https://www.swimcloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              SwimCloud
            </a>
            . Not affiliated with SwimCloud.
          </div>
        </footer>
      </body>
    </html>
  );
}
