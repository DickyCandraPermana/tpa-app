import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "sibaq/avatars";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Tidak ada file yang diunggah" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format file tidak didukung. Gunakan format JPG, PNG, WEBP, atau GIF",
        },
        { status: 415 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file melebihi batas maksimal 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      {
        error: "Gagal mengunggah gambar ke server penyimpanan",
        details: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
