import { NextResponse } from "next/server";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await prisma.order.findMany({ include: { user: true, course: true, payment: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ orders });
  } catch (error) {
    return authErrorResponse(error);
  }
}
