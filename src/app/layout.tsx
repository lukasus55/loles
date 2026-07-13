import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: {
    template: '%s - LOLES',
    default: 'LOLES',
  },
  description: 'Your personal League of Legends matchup notes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className={`${outfit.className} min-h-full flex flex-col bg-black text-white`}>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
