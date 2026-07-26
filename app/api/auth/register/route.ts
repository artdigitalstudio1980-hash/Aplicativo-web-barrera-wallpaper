import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/mailer";
import { logAudit } from "@/lib/audit";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        error: "Invalid fields",
        details: parsed.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const {
      firstName, lastName, email, password, phone,
      address, city, state, country, zipCode,
      dateOfBirth, howDidYouHear, preferredPayment, newsletterOptIn,
    } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || null,
        name: fullName,
        email,
        password: hashedPassword,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        zipCode: zipCode || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        howDidYouHear: howDidYouHear || null,
        preferredPayment: preferredPayment || null,
        newsletterOptIn: newsletterOptIn || false,
        role: "USER",
        isAdmin: false,
      },
    });

    try {
      await sendWelcomeEmail(user.email, user.firstName || "Customer");
    } catch (mailError) {
      console.error("Failed to send welcome email:", mailError);
    }

    logAudit({
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      email,
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: { id: user.id, name: user.name, email: user.email },
    }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 });
  }
}
