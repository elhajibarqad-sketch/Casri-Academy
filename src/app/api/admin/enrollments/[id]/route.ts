import { NextRequest, NextResponse } from "next/server";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

async function updateEnrollment(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const form = await request.formData();
    const action = String(form.get("action") ?? "");

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid enrollment action." }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data:
        action === "approve"
          ? { enrollmentStatus: "ACTIVE", paymentStatus: "PAID" }
          : { enrollmentStatus: "CANCELLED", paymentStatus: "FAILED" },
    });

    if (enrollment.orderId) {
      await prisma.order.update({
        where: { id: enrollment.orderId },
        data: { status: action === "approve" ? "PAID" : "FAILED" },
      });
    }

    return NextResponse.redirect(new URL("/admin/orders", request.url));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return updateEnrollment(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return updateEnrollment(request, context);
}
