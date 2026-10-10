"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  getLeaderboard,
  LeaderboardEntry,
} from "@/lib/services/leaderboardService";
import TactileCard from "@/components/ui/TactileCard";
import GoldBadge from "@/components/ui/GoldBadge";
import ArabicText from "@/components/ui/ArabicText";
import {
  Trophy,
  Medal,
  Crown,
  Sparkles,
  BookOpen,
  Award,
  Flame,
  User,
} from "lucide-react";

export default function LeaderboardPage() {
  const { uid } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard(20);
        setLeaderboard(data);
      } catch (err) {
        console.error("Gagal memuat papan peringkat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const firstPlace = leaderboard[0];
  const secondPlace = leaderboard[1];
  const thirdPlace = leaderboard[2];
  const remainingList = leaderboard.slice(3);

  const currentUserRank = leaderboard.find((item) => item.uid === uid);

  return (
    <div className="flex flex-col w-full gap-6 select-none pb-14">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-extrabold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Sabiqun bil Khairat</span>
          </div>
          <ArabicText text="سَابِقُوا" size="sm" className="text-emerald-900" />
        </div>

        <h1 className="text-2xl font-black text-slate-900">
          Papan Peringkat Santri
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Berlomba-lomba dalam kebaikan dan taklukkan puncak ilmu TPA!
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-bold">
            Menghitung peringkat para santri...
          </p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border-2 border-[#F3E8D6] p-8 shadow-xs">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800">
            Belum Ada Data Peringkat
          </h3>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Selesaikan setoran dan kuis materi untuk mencatatkan namamu di sini!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="pt-8 pb-4 px-2">
            <div className="flex items-end justify-center gap-2 sm:gap-3 max-w-sm mx-auto">
              {/* Rank 2 (Perak - Kiri) */}
              {secondPlace && (
                <div className="flex flex-col items-center flex-1">
                  <div className="relative mb-2 flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-slate-300 relative overflow-hidden bg-slate-100 shadow-md">
                      {secondPlace.avatarURL ? (
                        <Image
                          src={secondPlace.avatarURL}
                          alt={secondPlace.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-slate-500 text-lg">
                          {secondPlace.username.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 px-2 py-0.5 bg-slate-400 text-white rounded-full text-[10px] font-black border-2 border-white shadow">
                      #2
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-800 truncate max-w-[90px] text-center mt-1">
                    {secondPlace.username}
                  </span>
                  <div className="mt-1">
                    <GoldBadge type="coin" value={secondPlace.totalPoint} size="sm" />
                  </div>
                  {/* Podium Base #2 */}
                  <div className="w-full h-24 bg-slate-100 border-2 border-slate-300 rounded-t-2xl mt-2 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-2xl font-black text-slate-400">2</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perak</span>
                  </div>
                </div>
              )}

              {/* Rank 1 (Emas - Tengah Lebih Tinggi) */}
              {firstPlace && (
                <div className="flex flex-col items-center flex-1 relative -top-3">
                  <div className="relative mb-2 flex flex-col items-center">
                    <Crown className="w-7 h-7 text-amber-500 animate-bounce mb-1 drop-shadow" />
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-amber-400 relative overflow-hidden bg-amber-50 shadow-lg ring-4 ring-amber-300/30">
                      {firstPlace.avatarURL ? (
                        <Image
                          src={firstPlace.avatarURL}
                          alt={firstPlace.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-amber-600 text-xl">
                          {firstPlace.username.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-xs font-black border-2 border-white shadow">
                      #1
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900 truncate max-w-[100px] text-center mt-1">
                    {firstPlace.username}
                  </span>
                  <div className="mt-1">
                    <GoldBadge type="coin" value={firstPlace.totalPoint} size="sm" />
                  </div>
                  {/* Podium Base #1 */}
                  <div className="w-full h-32 bg-amber-100 border-2 border-amber-300 rounded-t-2xl mt-2 flex flex-col items-center justify-center shadow-inner">
                    <Trophy className="w-6 h-6 text-amber-600 mb-0.5" />
                    <span className="text-2xl font-black text-amber-600">1</span>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Juara 1</span>
                  </div>
                </div>
              )}

              {/* Rank 3 (Perunggu - Kanan) */}
              {thirdPlace && (
                <div className="flex flex-col items-center flex-1">
                  <div className="relative mb-2 flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-amber-700/60 relative overflow-hidden bg-amber-50 shadow-md">
                      {thirdPlace.avatarURL ? (
                        <Image
                          src={thirdPlace.avatarURL}
                          alt={thirdPlace.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-amber-800 text-lg">
                          {thirdPlace.username.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 px-2 py-0.5 bg-amber-700 text-white rounded-full text-[10px] font-black border-2 border-white shadow">
                      #3
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-800 truncate max-w-[90px] text-center mt-1">
                    {thirdPlace.username}
                  </span>
                  <div className="mt-1">
                    <GoldBadge type="coin" value={thirdPlace.totalPoint} size="sm" />
                  </div>
                  {/* Podium Base #3 */}
                  <div className="w-full h-20 bg-amber-50 border-2 border-amber-700/30 rounded-t-2xl mt-2 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-2xl font-black text-amber-800">3</span>
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Perunggu</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List Peringkat 4+ */}
          {remainingList.length > 0 && (
            <div className="flex flex-col gap-2.5 mt-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
                Peringkat Berikutnya
              </h3>

              <div className="flex flex-col gap-2">
                {remainingList.map((entry) => {
                  const isCurrent = entry.uid === uid;
                  return (
                    <div
                      key={entry.uid}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? "bg-emerald-50 border-emerald-400 shadow-sm ring-2 ring-emerald-400/30"
                          : "bg-white border-[#F3E8D6] shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank Badge */}
                        <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600 shrink-0">
                          {entry.rank}
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full border-2 border-slate-200 relative overflow-hidden bg-slate-50 shrink-0">
                          {entry.avatarURL ? (
                            <Image
                              src={entry.avatarURL}
                              alt={entry.username}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-xs">
                              {entry.username.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {entry.username}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-md text-[9px] font-black uppercase">
                                Kamu
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {entry.completedCourseCount} Materi Selesai
                          </span>
                        </div>
                      </div>

                      {/* Point Badge */}
                      <GoldBadge type="coin" value={entry.totalPoint} size="sm" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sticky Personal Rank Footer if user is ranked */}
          {currentUserRank && (
            <div className="fixed bottom-16 left-1/2 -translate-x-1/2 max-w-md w-full px-4 z-30 pointer-events-none">
              <div className="p-3 bg-slate-900/90 backdrop-blur-md text-white rounded-2xl shadow-xl flex items-center justify-between pointer-events-auto border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                    #{currentUserRank.rank}
                  </div>
                  <div>
                    <p className="text-xs font-black">Peringkat Kamu</p>
                    <p className="text-[10px] text-slate-400">
                      Tetap istiqomah belajar!
                    </p>
                  </div>
                </div>
                <GoldBadge type="coin" value={currentUserRank.totalPoint} size="sm" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
