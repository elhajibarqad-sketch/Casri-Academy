import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const form = await request.formData();
    const parsed = profileSchema.safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });

    await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { phone: parsed.data.phone || null, bio: parsed.data.bio || null },
      create: { userId: user.id, phone: parsed.data.phone || null, bio: parsed.data.bio || null },
    });
    return NextResponse.redirect(new URL("/dashboard/profile?saved=1", request.url));
  } catch (error) {
    return authErrorResponse(error);
  }
}
