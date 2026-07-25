import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcryptjs";

async function checkAdmin(session: any) {
  if (!session?.user || !(session.user as any).isAdmin) {
    return false;
  }
  return true;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!(await checkAdmin(session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, role, isAdmin, password } = body;

    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (email && email !== existing.email) {
      const duplicate = await prisma.user.findUnique({ where: { email } });
      if (duplicate) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    const data: any = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (email !== undefined) data.email = email.toLowerCase();
    if (phone !== undefined) data.phone = phone;
    if (role !== undefined) data.role = role;
    if (isAdmin !== undefined) data.isAdmin = isAdmin;
    if (firstName !== undefined || lastName !== undefined) {
      data.name = `${firstName || existing.firstName} ${lastName !== undefined ? lastName : existing.lastName}`.trim();
    }
    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
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
      },
    });

    logAudit({
      action: "ADMIN_UPDATED_USER",
      entity: "User",
      entityId: params.id,
      userId: (session.user as any).id,
      email: user.email,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!(await checkAdmin(session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if ((session.user as any).id === params.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    logAudit({
      action: "ADMIN_DELETED_USER",
      entity: "User",
      entityId: params.id,
      userId: (session.user as any).id,
      email: user.email,
    });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
