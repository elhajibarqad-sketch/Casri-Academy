import { NextRequest, NextResponse } from "next/server";
import { authErrorResponse, requireVerifiedUser } from "@/lib/auth/guards";
import { validateCsrfToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { createCheckoutSession } from "@/lib/payments/provider";
import { prisma } from "@/lib/prisma";

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
    if (!course || course.status !== "PUBLISHED") return NextResponse.json({ error: "Course not available." }, { status: 404 });

    const order = await prisma.order.create({
      data: { userId: user.id, courseId: course.id, totalCents: course.priceCents, currency: course.currency },
    });
    const checkout = await createCheckoutSession({
      orderId: order.id,
      courseId: course.id,
      courseTitle: course.title,
      amountCents: course.priceCents,
      currency: course.currency,
      userEmail: user.email,
    });
    if (checkout.provider === "manual") {
      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          provider: "manual",
          amountCents: course.priceCents,
          currency: course.currency,
          status: "PAID",
          metadata: { orderId: order.id },
        },
      });
      await prisma.order.update({ where: { id: order.id }, data: { status: "PAID", paymentId: payment.id } });
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
        update: { orderId: order.id, paymentStatus: "PAID", enrollmentStatus: "ACTIVE" },
        create: { userId: user.id, courseId: course.id, orderId: order.id, paymentStatus: "PAID", enrollmentStatus: "ACTIVE" },
      });
    }

    return NextResponse.redirect(checkout.checkoutUrl ?? `${env.APP_URL}/dashboard/orders/confirmation?order=${order.id}`);
  } catch (error) {
    return authErrorResponse(error);
  }
}
