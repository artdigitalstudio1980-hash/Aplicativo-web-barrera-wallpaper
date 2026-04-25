import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

async function runTest() {
  console.log("Starting registration test...");
  const testEmail = "testuser@barrerawallpaper.com";
  
  try {
    // 1. Clean up existing test user
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    console.log("Cleaned up existing test user.");

    // 2. Hash password
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    // 3. Create user
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: testEmail,
        password: hashedPassword,
      },
    });
    console.log("User created successfully:", user.id);

    // 4. Verify password
    const savedUser = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!savedUser || !savedUser.password) throw new Error("User or password not found.");
    
    const isMatch = await bcrypt.compare("Password123!", savedUser.password as string);
    
    if (isMatch) {
      console.log("Password verification passed.");
    } else {
      throw new Error("Password verification failed.");
    }

    console.log("Registration test completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

runTest();
