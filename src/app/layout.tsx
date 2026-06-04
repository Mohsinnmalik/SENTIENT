import type { Metadata } from "next";
import { Space_Grotesk, Lexend, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Navbar } from "@/components/navbar";
import { NeuralSensorPortal } from "@/components/neural-sensor-portal";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SENTIENT | AI-Powered Product Review Questions",
  description: "Modern full-stack web application for generating AI-powered review questions for product interaction sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <NeuralSensorPortal />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
