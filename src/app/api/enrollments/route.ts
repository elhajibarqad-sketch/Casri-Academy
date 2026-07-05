import { NextRequest, NextResponse } from "next/server";
import { authErrorResponse, requireVerifiedUser } from "@/lib/auth/guards";
import { validateCsrfToken } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function dashboardRedirect(request: NextRequest, message: string) {
  const url = new URL("/dashboard", request.url);
  url.searchParams.set("enrollment", message);
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireVerifiedUser();

    // CSRF protection
    if (!validateCsrfToken(request)) {
      return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
    }

    const form = await request.formData();
    const courseId = String(form.get("courseId") ?? "");
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course || course.status !== "PUBLISHED") {
      return dashboardRedirect(request, "course-unavailable");
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    if (existing) {
      return dashboardRedirect(request, existing.enrollmentStatus.toLowerCase());
    }

    if (course.priceCents === 0) {
      await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          paymentStatus: "PAID",
          enrollmentStatus: "ACTIVE",
        },
      });
      return dashboardRedirect(request, "active");
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        courseId: course.id,
        totalCents: course.priceCents,
        currency: course.currency,
        status: "PENDING",
      },
    });
    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        orderId: order.id,
        paymentStatus: "PENDING",
        enrollmentStatus: "PENDING",
      },
    });

    const url = new URL(`/dashboard/checkout/${course.id}`, request.url);
    url.searchParams.set("order", order.id);
    return NextResponse.redirect(url);
  } catch (error) {
    return authErrorResponse(error);
  }
}
