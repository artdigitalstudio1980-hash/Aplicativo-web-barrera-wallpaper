import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/mailer";

// Helper function to sanitize string inputs for security
function sanitizeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/&/g, '&amp;');
}

// Basic email format validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password complexity: Requires at least 8 characters
const PASSWORD_MIN_LENGTH = 8;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, phone } = body;

    // --- Input Validation ---
    if (!firstName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields (First Name, Email, Password)" }, { status: 400 });
    }

    // Email format validation
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Password validation: length constraint
    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` }, { status: 400 });
    }
    // --- End Input Validation ---

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
    }

    // Sanitize names
    const sanitizedFirstName = sanitizeString(firstName);
    const sanitizedLastName = sanitizeString(lastName || "");
    const fullName = `${sanitizedFirstName} ${sanitizedLastName}`.trim();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        name: fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        role: "USER",
        isAdmin: false
      },
    });

    // Send welcome email asynchronously
    // Note: We don't await this if we want to return response faster, 
    // but for registration confirmation it's better to ensure it's sent or at least attempted.
    try {
      await sendWelcomeEmail(user.email, user.firstName || "Customer");
    } catch (mailError) {
      console.error("Failed to send welcome email:", mailError);
      // We don't fail the registration if email fails
    }

    // Return minimal user info, avoid sending sensitive data
    return NextResponse.json({ 
      success: true, 
      message: "User created successfully", 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 });
  }
}
