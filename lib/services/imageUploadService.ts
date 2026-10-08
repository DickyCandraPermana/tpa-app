import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export interface UploadImageResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Upload an image file to Cloudinary via SibaQ API route.
 * @param file The image File to upload
 * @param folder Target folder in Cloudinary (default: 'sibaq/avatars')
 */
export async function uploadImage(
  file: File,
  folder = "sibaq/avatars"
): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal mengunggah gambar");
  }

  return data as UploadImageResult;
}

/**
 * Update user avatarURL in Firestore and Firebase Auth profile.
 * @param uid User ID
 * @param avatarURL Cloudinary secure URL
 */
export async function updateUserAvatar(
  uid: string,
  avatarURL: string
): Promise<void> {
  if (!uid || !avatarURL) {
    throw new Error("UID dan Avatar URL harus diisi");
  }

  // 1. Update Firestore user document
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    avatarURL,
    updatedAt: serverTimestamp(),
  });

  // 2. Update Firebase Auth currentUser if it matches
  if (auth.currentUser && auth.currentUser.uid === uid) {
    try {
      await updateProfile(auth.currentUser, {
        photoURL: avatarURL,
      });
    } catch (e) {
      console.warn("Failed to update Firebase Auth profile photoURL:", e);
    }
  }
}
