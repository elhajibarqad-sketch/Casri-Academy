import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const heroSlideSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  imageUrl: z.string().url(),
  order: z.coerce.number().int().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const form = await request.formData();
    const parsed = heroSlideSchema.safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) return NextResponse.json({ error: "Invalid hero slide data." }, { status: 400 });
    const slide = await prisma.heroSlide.create({ data: parsed.data });
    await prisma.adminLog.create({ data: { actorId: admin.id, action: "heroSlide.create", entity: "HeroSlide", entityId: slide.id } });
    return NextResponse.redirect(new URL("/admin/content", request.url));
  } catch (error) {
    return authErrorResponse(error);
  }
}
