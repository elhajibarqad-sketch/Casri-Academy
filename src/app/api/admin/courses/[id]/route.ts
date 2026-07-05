import { NextRequest, NextResponse } from "next/server";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { courseUpdateSchema } from "@/lib/validators/course";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const parsed = courseUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid course data." }, { status: 400 });

    const course = await prisma.course.update({
      where: { id },
      data: parsed.data,
      include: { lessons: { orderBy: { order: "asc" } } },
    });
    await prisma.adminLog.create({ data: { actorId: admin.id, action: "course.update", entity: "Course", entityId: course.id } });
    return NextResponse.json({ course });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const course = await prisma.course.update({ where: { id }, data: { status: "ARCHIVED" } });
    await prisma.adminLog.create({ data: { actorId: admin.id, action: "course.archive", entity: "Course", entityId: course.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
