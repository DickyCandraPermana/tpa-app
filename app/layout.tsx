// app/layout.tsx

import "@/styles/globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TPA Learning App",
  description: "Latihan TPA interaktif dengan teks & suara Arab",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br bg-cover bg-no-repeat h-screen from-indigo-100 to-indigo-300 text-gray-900`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
