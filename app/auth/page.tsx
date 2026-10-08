"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import TactileButton from "@/components/ui/TactileButton";
import TactileCard from "@/components/ui/TactileCard";
import ArabicText from "@/components/ui/ArabicText";
import { LogIn, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen w-full bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Back to Home */}
        <Link
          href="/"
          className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <TactileCard className="w-full p-6 flex flex-col items-center text-center">
          <ArabicText text="أَهْلًا وَسَهْلًا" size="lg" className="text-emerald-900 mb-2" />

          {/* Banner image */}
          <div className="w-full h-32 rounded-2xl overflow-hidden relative mb-4 border border-[#F3E8D6]">
            <Image
              src="/assets/login_banner.jpg"
              alt="Selamat Datang di SibaQ"
              fill
              className="object-cover"
            />
          </div>

          <h1 className="text-xl font-black text-slate-900 mb-1">
            Selamat Datang di SibaQ
          </h1>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Pilih langkah untuk memulai petualangan mengaji:
          </p>

          <div className="flex flex-col gap-3 w-full">
            <TactileButton
              fullWidth
              variant="primary"
              size="md"
              onClick={() => router.push("/login")}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk (Login)</span>
            </TactileButton>

            <TactileButton
              fullWidth
              variant="secondary"
              size="md"
              onClick={() => router.push("/register")}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun Baru</span>
            </TactileButton>
          </div>
        </TactileCard>
      </div>
    </main>
  );
}
