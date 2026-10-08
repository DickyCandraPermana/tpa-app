import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock cloudinary v2
vi.mock("cloudinary", () => {
  return {
    v2: {
      config: vi.fn(),
      uploader: {
        upload: vi.fn(),
      },
    },
  };
});

import { POST } from "@/app/api/upload/route";
import { v2 as cloudinary } from "cloudinary";

describe("POST /api/upload (Cloudinary Image Upload API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when no file is provided in formData", async () => {
    const formData = new FormData();
    const req = new Request("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/tidak ada file/i);
  });

  it("returns 415 when file type is not an allowed image format", async () => {
    const formData = new FormData();
    const dummyBlob = new Blob(["fake pdf content"], { type: "application/pdf" });
    const fakeFile = new File([dummyBlob], "document.pdf", { type: "application/pdf" });
    formData.append("file", fakeFile);

    const req = new Request("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(415);

    const json = await res.json();
    expect(json.error).toMatch(/format file tidak didukung/i);
  });

  it("returns 400 when file size exceeds 5MB limit", async () => {
    const formData = new FormData();
    const bigFile = new File([new Uint8Array(6 * 1024 * 1024)], "huge.png", {
      type: "image/png",
    });
    formData.append("file", bigFile);

    const req = new Request("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/melebihi batas maksimal 5MB/i);
  });

  it("successfully uploads valid image to Cloudinary and returns secure_url", async () => {
    const mockUploadResult = {
      secure_url: "https://res.cloudinary.com/dogolfub6/image/upload/v12345/sibaq/avatars/avatar123.jpg",
      public_id: "sibaq/avatars/avatar123",
      width: 400,
      height: 400,
      format: "jpg",
    };

    (cloudinary.uploader.upload as any).mockResolvedValueOnce(mockUploadResult);

    const formData = new FormData();
    const validBlob = new Blob(["fake image data"], { type: "image/jpeg" });
    const validFile = new File([validBlob], "photo.jpg", { type: "image/jpeg" });
    formData.append("file", validFile);
    formData.append("folder", "sibaq/avatars");

    const req = new Request("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.url).toBe(mockUploadResult.secure_url);
    expect(json.publicId).toBe(mockUploadResult.public_id);
    expect(cloudinary.uploader.upload).toHaveBeenCalledTimes(1);
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      expect.stringContaining("data:image/jpeg;base64,"),
      expect.objectContaining({
        folder: "sibaq/avatars",
        resource_type: "image",
      })
    );
  });

  it("returns 500 when Cloudinary upload throws an error", async () => {
    (cloudinary.uploader.upload as any).mockRejectedValueOnce(new Error("Cloudinary connection failed"));

    const formData = new FormData();
    const validBlob = new Blob(["fake image data"], { type: "image/png" });
    const validFile = new File([validBlob], "photo.png", { type: "image/png" });
    formData.append("file", validFile);

    const req = new Request("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toMatch(/gagal mengunggah gambar/i);
  });
});
