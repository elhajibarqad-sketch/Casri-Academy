import { NextResponse } from "next/server";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, enrollments: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch (error) {
    return authErrorResponse(error);
  }
}
