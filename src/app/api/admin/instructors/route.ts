import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const instructorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  specialty: z.string().min(2),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const form = await request.formData();
    const parsed = instructorSchema.safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) return NextResponse.json({ error: "Invalid instructor data." }, { status: 400 });
    const instructor = await prisma.instructor.create({
      data: { ...parsed.data, avatarUrl: parsed.data.avatarUrl || null },
    });
    await prisma.adminLog.create({ data: { actorId: admin.id, action: "instructor.create", entity: "Instructor", entityId: instructor.id } });
    return NextResponse.redirect(new URL("/admin/instructors", request.url));
  } catch (error) {
    return authErrorResponse(error);
  }
}
