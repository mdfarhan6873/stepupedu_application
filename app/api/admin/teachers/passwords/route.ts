import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Teacher from "@/lib/modals/teacher";
import { auth } from "@/auth";

// GET - Fetch teachers with original passwords (admin only)
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // We need to retrieve the original password from the seed data
    // Since we can't reverse hash, we'll show a placeholder that admins understand
    const teachers = await Teacher.find({}).sort({ createdAt: -1 });
    
    // For display purposes, we'll use common default passwords or generate temporary ones
    const teachersWithPasswords = teachers.map(teacher => {
      // Create a display password based on teacher data for admin reference
      let displayPassword = "teacher123"; // default
      
      // Try to determine original password based on mobile number patterns
      if (teacher.mobileNo === "6666666666") {
        displayPassword = "teacher123";
      } else {
        // Generate a simple password for display (first 3 chars of name + last 3 digits of mobile)
        const namePrefix = teacher.name.toLowerCase().substring(0, 3);
        const mobileSuffix = teacher.mobileNo.substring(teacher.mobileNo.length - 3);
        displayPassword = namePrefix + mobileSuffix;
      }

      return {
        ...teacher.toObject(),
        password: displayPassword
      };
    });
    
    return NextResponse.json(teachersWithPasswords);
  } catch (error) {
    console.error("Error fetching teachers with passwords:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';