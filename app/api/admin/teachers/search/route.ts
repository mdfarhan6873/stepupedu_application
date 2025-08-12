import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Teacher from "@/lib/modals/teacher";
import { auth } from "@/auth";

// GET - Search teachers by mobile number and name
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    
    if (!query) {
      return NextResponse.json([]);
    }

    // Create search filter - search in multiple fields
    const searchFilter = {
      $or: [
        { mobileNo: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    };

    const teachers = await Teacher.find(searchFilter)
      .select('name mobileNo subjects')
      .limit(10)
      .sort({ name: 1 });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error searching teachers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';