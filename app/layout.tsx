import "@/styles/globals.css";
import { ReactNode } from "react";
import { Nunito, Amiri } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { UserProgressProvider } from "@/context/UserProgressContext";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#064E3B" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
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
    <html
      lang="id"
      suppressHydrationWarning
      className={`${nunito.variable} ${amiri.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('sibaq_user_settings');
                  var isDark = false;
                  if (raw) {
                    var s = JSON.parse(raw);
                    isDark = s.darkMode === true || s.theme === 'oled' || (s.theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  }
                  if (isDark) {
                    document.documentElement.setAttribute('data-theme', 'oled');
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.removeAttribute('data-theme');
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#FDFBF7] dark:bg-[#000000] text-slate-800 dark:text-neutral-100 min-h-screen antialiased">
        <ServiceWorkerRegister />
        <AuthProvider>
          <UserProgressProvider>{children}</UserProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
