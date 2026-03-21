import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { syncCatalog } from "@/lib/sync-service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Verify session and role
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 });
    }

    console.log("Starting catalog synchronization...");
    
    const result = await syncCatalog();

    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ message: "Internal server error during synchronization" }, { status: 500 });
  }
}
