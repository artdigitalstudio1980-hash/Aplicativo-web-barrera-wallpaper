import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Faltan datos requeridos" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "El correo ya está registrado" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Al crear el usuario, por defecto tendrá role USER y isAdmin false.
      },
    });

    return NextResponse.json({ message: "Usuario creado exitosamente", user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
