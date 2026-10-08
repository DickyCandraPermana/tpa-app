"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import ArabicText from "@/components/ui/ArabicText";
import GoldBadge from "@/components/ui/GoldBadge";
import { createReward } from "@/lib/services/rewardService";
import { uploadImage } from "@/lib/services/imageUploadService";
import { Reward } from "@/types/schema";
import {
  X,
  Gift,
  Upload,
  Coins,
  Package,
  FileText,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";

export interface AddRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReward: Reward) => void;
}

export default function AddRewardModal({
  isOpen,
  onClose,
  onSuccess,
}: AddRewardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointsRequired, setPointsRequired] = useState<string>("");
  const [stock, setStock] = useState<string>("10");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WEBP, atau GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama hadiah wajib diisi.");
      return;
    }

    const points = Number(pointsRequired);
    if (isNaN(points) || points <= 0) {
      setError("Harga koin harus berupa angka positif.");
      return;
    }

    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      setError("Stok tidak boleh bernilai negatif.");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined = undefined;

      if (selectedFile) {
        const uploadRes = await uploadImage(selectedFile, "sibaq/rewards");
        imageUrl = uploadRes.url;
      }

      const newReward = await createReward({
        name: name.trim(),
        description: description.trim(),
        pointsRequired: points,
        stock: stockNum,
        ...(imageUrl ? { imageUrl } : {}),
      });

      // Reset form
      setName("");
      setDescription("");
      setPointsRequired("");
      setStock("10");
      handleRemoveImage();

      onSuccess(newReward);
    } catch (err: any) {
      console.error("Error creating reward:", err);
      setError(err?.message || "Gagal menambahkan hadiah baru. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <TactileCard className="relative overflow-hidden border-2 border-emerald-700/40 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100/60">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200/50">
                <Gift className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Tambah Hadiah Baru
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Katalog hadiah santri TPA
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Nama Hadiah */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reward-name"
                className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nama Hadiah</span>
              </label>
              <input
                id="reward-name"
                type="text"
                placeholder="Contoh: Juz Amma Tajwid Warna"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50"
                required
              />
            </div>

            {/* Deskripsi */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reward-desc"
                className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deskripsi (Opsional)</span>
              </label>
              <textarea
                id="reward-desc"
                rows={2}
                placeholder="Tuliskan keterangan detail hadiah..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="px-3.5 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50 resize-none"
              />
            </div>

            {/* Harga Koin & Stok (Grid) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reward-points"
                  className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>Harga Koin</span>
                </label>
                <input
                  id="reward-points"
                  type="number"
                  min="1"
                  placeholder="25"
                  value={pointsRequired}
                  onChange={(e) => setPointsRequired(e.target.value)}
                  disabled={isSubmitting}
                  className="px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reward-stock"
                  className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5 text-teal-600" />
                  <span>Jumlah Stok</span>
                </label>
                <input
                  id="reward-stock"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  disabled={isSubmitting}
                  className="px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Thumbnail Upload Cloudinary */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Foto Hadiah (Cloudinary)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                data-testid="reward-image-input"
                className="hidden"
                disabled={isSubmitting}
              />

              {previewUrl ? (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-emerald-50 flex items-center justify-center group">
                  <Image
                    src={previewUrl}
                    alt="Preview Hadiah"
                    fill
                    className="object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="px-2.5 py-1.5 bg-white text-slate-800 text-[11px] font-bold rounded-lg shadow hover:bg-slate-100 transition-all"
                    >
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                      className="p-1.5 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center gap-1.5 p-4 border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-2xl transition-all cursor-pointer text-slate-400 hover:text-emerald-700 disabled:opacity-50"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-bold">Pilih Foto Hadiah</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    PNG, JPG, WEBP (Max 5MB)
                  </span>
                </button>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-2.5 pt-3 mt-1 border-t border-slate-100">
              <TactileButton
                type="button"
                variant="ghost"
                size="sm"
                fullWidth
                disabled={isSubmitting}
                onClick={onClose}
              >
                Batal
              </TactileButton>

              <TactileButton
                type="submit"
                variant="primary"
                size="sm"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </span>
                ) : (
                  <span>Simpan Hadiah</span>
                )}
              </TactileButton>
            </div>
          </form>
        </TactileCard>
      </div>
    </div>
  );
}
