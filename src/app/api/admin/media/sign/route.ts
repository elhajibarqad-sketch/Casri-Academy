import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";
import { env } from "@/lib/env";

const mediaSignSchema = z.object({
  folder: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9/_-]+$/)
    .max(120)
    .default("casri-academy/courses"),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    if (env.MEDIA_PROVIDER !== "cloudinary") {
      return NextResponse.json({ error: "Media uploads are disabled. Set MEDIA_PROVIDER=cloudinary and configure Cloudinary keys." }, { status: 503 });
    }

    const parsed = mediaSignSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });

    const { folder } = parsed.data;
    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary environment variables are not configured." }, { status: 503 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(signatureBase).digest("hex");

    return NextResponse.json({
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
