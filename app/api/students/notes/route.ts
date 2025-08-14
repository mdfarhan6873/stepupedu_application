import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Notes from "@/lib/modals/notes";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    // Allow only logged-in users with one of the allowed roles
    if (!session || !["admin", "teacher", "student"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch all notes, sorted by latest first
    const notes = await Notes.find({}).sort({ createdAt: -1 });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
