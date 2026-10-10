import "@/styles/globals.css";
import { ReactNode } from "react";
import { Nunito, Amiri } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { UserProgressProvider } from "@/context/UserProgressContext";

import type { Metadata, Viewport } from "next";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const viewport: Viewport = {
  themeColor: "#064E3B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "SibaQ - Taman Belajar Santri",
  description: "Platform belajar mengaji interaktif berestetika Islami modern dan ramah santri.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SibaQ",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${nunito.variable} ${amiri.variable}`}>
      <body className="bg-[#FDFBF7] text-slate-800 min-h-screen antialiased">
        <AuthProvider>
          <UserProgressProvider>{children}</UserProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
