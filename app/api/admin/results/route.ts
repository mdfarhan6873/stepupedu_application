import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Results from "@/lib/modals/results";
import { auth } from "@/auth";

// GET - Fetch all results
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const results = await Results.find({}).sort({ createdAt: -1 });
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new result
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Check if result with same title already exists for the same class, section and subject
    const existingResult = await Results.findOne({ 
      title: data.title,
      class: data.class,
      section: data.section,
      subject: data.subject 
    });
    
    if (existingResult) {
      return NextResponse.json({ error: "Result with this title already exists for this class, section and subject" }, { status: 400 });
    }

    const result = new Results({
      ...data,
      createdBy: session.user.name || 'admin'
    });
    await result.save();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating result:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';