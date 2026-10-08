"use client";

import { useState, useEffect } from "react";
import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import TactileButton from "@/components/ui/TactileButton";
import TactileCard from "@/components/ui/TactileCard";
import ArabicText from "@/components/ui/ArabicText";
import Link from "next/link";
import { UserPlus, ArrowLeft, Mail, Lock, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { uid } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!email || !password || !confirmPassword) {
      setErr("Mohon isi semua kolom yang tersedia.");
      return;
    }

    if (password.length < 6) {
      setErr("Password minimal harus 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(email, password);
      if (res.success) {
        router.push("/login");
      } else {
        setErr(res.message || "Pendaftaran gagal, coba lagi nanti.");
      }
    } catch (err: any) {
      setErr(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) {
      router.push("/dashboard");
    }
  }, [uid, router]);

  return (
    <main className="min-h-screen w-full bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Back Link */}
        <Link
          href="/auth"
          className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>

        <TactileCard className="w-full p-6 sm:p-7">
          <div className="text-center mb-6">
            <ArabicText text="مَرْحَبًا" size="sm" className="text-emerald-800 mb-1" />
            <h1 className="text-2xl font-black text-slate-900">Buat Akun Santri</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Daftar untuk mulai mengumpulkan poin dan menghafal hijaiyah
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="santri@tpa.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border-2 border-[#E2D4BE] text-slate-800 text-sm font-semibold focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border-2 border-[#E2D4BE] text-slate-800 text-sm font-semibold focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border-2 border-[#E2D4BE] text-slate-800 text-sm font-semibold focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {err && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <TactileButton
              fullWidth
              variant="accent"
              size="md"
              type="submit"
              disabled={loading}
              className="mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? "Mendaftarkan..." : "Daftar Akun Sekarang"}</span>
            </TactileButton>
          </form>

          <div className="mt-6 pt-4 border-t border-[#F3E8D6] text-center">
            <p className="text-xs text-slate-500 font-medium">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-extrabold text-emerald-700 hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </TactileCard>
      </div>
    </main>
  );
}
