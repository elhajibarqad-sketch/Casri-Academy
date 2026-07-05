import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: { lessons: { orderBy: { order: "asc" } }, previews: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ courses });
}
