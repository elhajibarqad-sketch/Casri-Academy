import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const course = await prisma.course.findUnique({ where: { id }, include: { lessons: { orderBy: { order: "asc" } }, previews: true } });
  if (!course || course.status !== "PUBLISHED") return NextResponse.json({ error: "Course not found." }, { status: 404 });

  const enrollment = user
    ? await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: id } } })
    : null;

  return NextResponse.json({
    course: {
      ...course,
      lessons: course.lessons.map((lesson: { isFree: boolean; videoUrl: string | null; pdfUrl: string | null }) =>
        lesson.isFree || enrollment ? lesson : { ...lesson, videoUrl: null, pdfUrl: null },
      ),
    },
    enrolled: Boolean(enrollment),
  });
}
