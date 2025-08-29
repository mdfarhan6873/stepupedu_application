import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import StudentMarksheet from '@/lib/modals/studentmarksheets';
import Student from '@/lib/modals/student';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get session to ensure student is authenticated
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    let query: any = {};
    
    if (studentId) {
      // Admin or specific student access
      query.studentId = studentId;
    } else if (session.user?.role === 'student') {
      // Student can only see their own marksheets
      const student = await Student.findOne({ mobileNo: session.user.mobileNo });
      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        );
      }
      query.studentId = student._id;
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    const marksheets = await StudentMarksheet.find(query)
      .sort({ examDate: -1, createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: marksheets
    });
    
  } catch (error: any) {
    console.error('Error fetching student marksheets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch marksheets',
        details: error.message 
      },
      { status: 500 }
    );
  }
}