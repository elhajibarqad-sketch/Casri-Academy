import { NextRequest, NextResponse } from "next/server";
import { authErrorResponse, requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const progressSchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean().default(false),
  secondsSeen: z.number().int().min(0).default(0),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = progressSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid progress payload." }, { status: 400 });

    const lesson = await prisma.lesson.findUnique({ where: { id: parsed.data.lessonId }, include: { course: true } });
    if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

    const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: lesson.courseId } } });
    if (!lesson.isFree && !enrollment) return NextResponse.json({ error: "Course purchase required." }, { status: 402 });

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      update: parsed.data,
      create: { ...parsed.data, userId: user.id },
    });
    return NextResponse.json({ progress });
  } catch (error) {
    return authErrorResponse(error);
  }
}
