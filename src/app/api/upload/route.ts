import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado archivo" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no puede superar 5MB" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "guidepath/avatars",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
          ],
          resource_type: "image",
        },
        (error: unknown, result: { secure_url: string } | undefined) => {
          if (error || !result) reject(error || new Error("Upload failed"));
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    // Update user image in DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: result.secure_url },
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("[/api/upload]", error);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
