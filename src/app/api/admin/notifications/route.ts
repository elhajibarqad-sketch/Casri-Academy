import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const notificationSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(5),
  audience: z.string().min(2).default("all"),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const form = await request.formData();
    const parsed = notificationSchema.safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) return NextResponse.json({ error: "Invalid notification data." }, { status: 400 });
    const notification = await prisma.notification.create({ data: parsed.data });
    await prisma.adminLog.create({ data: { actorId: admin.id, action: "notification.create", entity: "Notification", entityId: notification.id } });
    return NextResponse.redirect(new URL("/admin/notifications", request.url));
  } catch (error) {
    return authErrorResponse(error);
  }
}
