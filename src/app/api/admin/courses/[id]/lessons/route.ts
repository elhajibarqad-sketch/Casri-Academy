import { NextRequest, NextResponse } from "next/server";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { lessonSchema } from "@/lib/validators/course";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const parsed = lessonSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid lesson data." }, { status: 400 });

    const lesson = await prisma.lesson.create({
      data: {
        ...parsed.data,
        courseId: id,
        videoUrl: parsed.data.videoUrl || null,
        pdfUrl: parsed.data.pdfUrl || null,
      },
    });
    await prisma.adminLog.create({ data: { actorId: admin.id, action: "lesson.create", entity: "Lesson", entityId: lesson.id } });
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
