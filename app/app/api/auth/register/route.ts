import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper function to sanitize string inputs for security (e.g., prevent XSS)
function sanitizeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/&/g, '&amp;')
    .replace(/\//g, '\\/'); // Escape forward slashes
}

// Basic email format validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // --- Input Validation ---
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required data (name, email, password)" }, { status: 400 });
    }

    // Email format validation
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    // Name validation: length constraints
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json({ message: "Name must be between 2 and 50 characters" }, { status: 400 });
    }

    // Password validation: length constraint (minimum complexity can be added here)
    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 });
    }
    // TODO: Implement password complexity requirements (e.g., uppercase, lowercase, number, special character)
    // Example: const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
    //   return NextResponse.json({ message: "Password does not meet complexity requirements" }, { status: 400 });
    // }
    // --- End Input Validation ---

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email is already registered" }, { status: 409 });
    }

    // Sanitize name before saving to prevent XSS
    const sanitizedName = sanitizeString(name);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: sanitizedName, // Use sanitized name
        email,
        password: hashedPassword,
        // Default role: USER, isAdmin: false
      },
    });

    // Return minimal user info, avoid sending sensitive data
    return NextResponse.json({ message: "User created successfully", user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
