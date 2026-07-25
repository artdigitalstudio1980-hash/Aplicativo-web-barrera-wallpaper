import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const stats = searchParams.get("stats");

  if (stats === "true") {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalProducts, totalOrders, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    return NextResponse.json({ success: true, totalUsers, totalProducts, totalOrders, recentUsers });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isAdmin: true,
      createdAt: true,
      emailVerified: true,
      _count: { select: { orders: true } },
    },
  });

  return NextResponse.json({ success: true, users });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { firstName, lastName, email, password, phone, role, isAdmin } = await req.json();

    if (!firstName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const fullName = `${firstName} ${lastName || ""}`.trim();

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || "",
        name: fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        role: role || "USER",
        isAdmin: isAdmin || false,
      },
    });

    logAudit({
      action: "ADMIN_CREATED_USER",
      entity: "User",
      entityId: user.id,
      userId: (session.user as any).id,
      email: email.toLowerCase(),
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
