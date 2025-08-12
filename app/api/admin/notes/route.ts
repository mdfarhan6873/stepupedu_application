import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Notes from "@/lib/modals/notes";
import { auth } from "@/auth";

// GET - Fetch all notes
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const notes = await Notes.find({}).sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new note
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Check if note with same title already exists for the same class and subject
    const existingNote = await Notes.findOne({ 
      title: data.title,
      class: data.class,
      subject: data.subject 
    });
    
    if (existingNote) {
      return NextResponse.json({ error: "Note with this title already exists for this class and subject" }, { status: 400 });
    }

    const note = new Notes({
      ...data,
      createdBy: session.user.name || 'admin'
    });
    await note.save();

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';