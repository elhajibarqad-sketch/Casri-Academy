import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { folder = "casri-academy/courses" } = await request.json();
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary environment variables are not configured." }, { status: 500 });
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
