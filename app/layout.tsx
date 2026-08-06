// app/layout.tsx

import "@/styles/globals.css";
import { ReactNode } from "react";
import { Nunito } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { UserProgressProvider } from "@/context/UserProgressContext";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata = {
  title: "SibaQ - TPA Interaktif",
  description: "Pembelajaran TPA Interaktif berbasis kuis, visual, dan audio.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${nunito.className} bg-slate-50 text-slate-900 min-h-screen`}
      >
        <AuthProvider>
          <UserProgressProvider>{children}</UserProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
