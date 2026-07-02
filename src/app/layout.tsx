import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import AboutModal from "@/components/about-modal";
import AuthProvider from "@/components/auth-provider";
import NavLinks from "@/components/nav-links";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "parallax",
  description: "one topic, many angles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <nav className="glass-strong sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-serif text-xl tracking-tight text-foreground">
              parallax<span className="text-accent">.</span>
            </a>
            <div className="flex items-center gap-5 text-sm">
              <NavLinks />
              <AboutModal />
            </div>
          </nav>
          <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
