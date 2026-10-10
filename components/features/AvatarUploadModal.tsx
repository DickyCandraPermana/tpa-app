"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import { uploadImage, updateUserAvatar } from "@/lib/services/imageUploadService";
import { Camera, Upload, X, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export interface AvatarUploadModalProps {
  isOpen: boolean;
  currentAvatarUrl: string | null;
  userId: string;
  onClose: () => void;
  onSuccess: (newAvatarUrl: string) => void;
}

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function AvatarUploadModal({
  isOpen,
  currentAvatarUrl,
  userId,
  onClose,
  onSuccess,
}: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setSuccessMessage("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Format file harus berupa gambar (JPG, PNG, WEBP, atau GIF)");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`Ukuran file melebihi batas maksimal ${MAX_SIZE_MB}MB`);
      return;
    }

    setSelectedFile(file);
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } catch {
      // Fallback
      setPreviewUrl(null);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage("");
    setSuccessMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Upload to Cloudinary via SibaQ API
      const result = await uploadImage(selectedFile, "sibaq/avatars");

      // 2. Update Firestore and Firebase Auth profile
      if (userId) {
        await updateUserAvatar(userId, result.url);
      }

      setSuccessMessage("Foto profil berhasil diperbarui!");
      setTimeout(() => {
        onSuccess(result.url);
        handleClose();
      }, 700);
    } catch (err: any) {
      console.error("Upload avatar error:", err);
      setErrorMessage(err?.message || "Gagal mengunggah foto profil. Coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  const displayAvatar = previewUrl || currentAvatarUrl || "/assets/profile_picture_placeholder.png";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <TactileCard className="p-6 bg-white border-2 border-emerald-700/20 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-emerald-100 mb-5">
            <div className="flex items-center gap-2 text-emerald-800">
              <Camera className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-black text-slate-800">Ubah Foto Profil</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative w-28 h-28 rounded-full p-1 bg-white border-2 border-emerald-600 shadow-xs">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-emerald-50 border-2 border-white">
                  <Image
                    src={displayAvatar}
                    alt="Preview Avatar"
                    fill
                    className="object-cover"
                    unoptimized={!!previewUrl}
                  />
                </div>
                {previewUrl && (
                  <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full shadow border border-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {selectedFile ? selectedFile.name : "Pratinjau Foto Profil"}
              </p>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Upload Area / Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group bg-emerald-50/10"
            >
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-emerald-900 group-hover:text-emerald-700">
                  {selectedFile ? "Pilih foto lain" : "Pilih foto dari perangkat"}
                </span>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Maksimal 5MB (JPG, PNG, WEBP)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                onChange={handleFileChange}
                className="hidden"
                data-testid="avatar-file-input"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <TactileButton
                variant="secondary"
                size="md"
                onClick={handleClose}
                disabled={isUploading}
              >
                Batal
              </TactileButton>

              <TactileButton
                variant="primary"
                size="md"
                type="submit"
                disabled={!selectedFile || isUploading}
                className="flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Simpan Foto</span>
                  </>
                )}
              </TactileButton>
            </div>
          </form>
        </TactileCard>
      </div>
    </div>
  );
}
