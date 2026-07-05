import { NextRequest, NextResponse } from "next/server";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";
import { validateCsrfToken } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validators/course";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ courses: await prisma.course.findMany({ orderBy: { createdAt: "desc" }, include: { lessons: true } }) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    // CSRF protection
    if (!validateCsrfToken(request)) {
      return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
    }

    const parsed = courseSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid course data." }, { status: 400 });
    const course = await prisma.course.create({ data: { ...parsed.data, status: "DRAFT" } });
    await prisma.adminLog.create({ data: { actorId: admin.id, action: "course.create", entity: "Course", entityId: course.id } });
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
