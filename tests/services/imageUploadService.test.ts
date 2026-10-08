import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadImage, updateUserAvatar } from "@/lib/services/imageUploadService";

// Mock firebase firestore & auth
vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {
    currentUser: {
      uid: "user-123",
      photoURL: "https://example.com/old.png",
    },
  },
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(() => "mock-doc-ref"),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "mock-timestamp"),
}));

vi.mock("firebase/auth", () => ({
  updateProfile: vi.fn(),
}));

import { updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

describe("imageUploadService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadImage", () => {
    it("calls POST /api/upload with FormData and returns url and publicId", async () => {
      const mockSuccessResponse = {
        url: "https://res.cloudinary.com/dogolfub6/image/upload/v1/sibaq/avatars/test.png",
        publicId: "sibaq/avatars/test",
      };

      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      } as any);

      const fakeFile = new File(["dummy content"], "avatar.png", { type: "image/png" });
      const result = await uploadImage(fakeFile, "sibaq/avatars");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/upload",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );
      expect(result.url).toBe(mockSuccessResponse.url);
      expect(result.publicId).toBe(mockSuccessResponse.publicId);
    });

    it("throws descriptive error when server returns failure", async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Ukuran file melebihi batas maksimal 5MB" }),
      } as any);

      const fakeFile = new File(["dummy content"], "huge.png", { type: "image/png" });

      await expect(uploadImage(fakeFile)).rejects.toThrow(
        "Ukuran file melebihi batas maksimal 5MB"
      );
    });
  });

  describe("updateUserAvatar", () => {
    it("updates firestore user document and firebase auth photoURL", async () => {
      (updateDoc as any).mockResolvedValueOnce(undefined);
      (updateProfile as any).mockResolvedValueOnce(undefined);

      const newAvatarUrl = "https://res.cloudinary.com/dogolfub6/image/upload/v1/sibaq/avatars/new.png";
      await updateUserAvatar("user-123", newAvatarUrl);

      expect(updateDoc).toHaveBeenCalledWith("mock-doc-ref", {
        avatarURL: newAvatarUrl,
        updatedAt: "mock-timestamp",
      });
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ uid: "user-123" }),
        { photoURL: newAvatarUrl }
      );
    });

    it("throws error if uid or avatarUrl is missing", async () => {
      await expect(updateUserAvatar("", "https://url")).rejects.toThrow(
        "UID dan Avatar URL harus diisi"
      );
      await expect(updateUserAvatar("user-123", "")).rejects.toThrow(
        "UID dan Avatar URL harus diisi"
      );
    });
  });
});
