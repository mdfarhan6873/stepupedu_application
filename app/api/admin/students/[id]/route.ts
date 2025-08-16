// api/admin/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Student from '@/lib/modals/student';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const student = await Student.findById(params.id);
    
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('Error fetching student details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student details' },
      { status: 500 }
    );
  }
}