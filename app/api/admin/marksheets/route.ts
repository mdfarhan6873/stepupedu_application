import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import StudentMarksheet from '@/lib/modals/studentmarksheets';
import Student from '@/lib/modals/student';
import { auth } from '@/auth';

// GET - Fetch all marksheets or filter by query
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const class_name = searchParams.get('class');
    const section = searchParams.get('section');
    const examTitle = searchParams.get('examTitle');
    
    let query: any = {};
    
    if (studentId) {
      query.studentId = studentId;
    }
    
    if (class_name) {
      query.class = class_name;
    }
    
    if (section) {
      query.section = section;
    }
    
    if (examTitle) {
      query.examTitle = { $regex: examTitle, $options: 'i' };
    }
    
    const marksheets = await StudentMarksheet.find(query)
      .populate('studentId', 'name rollNo class section mobileNo')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: marksheets
    });
    
  } catch (error: any) {
    console.error('Error fetching marksheets:', error);
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

// POST - Create new marksheet
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    await connectToDatabase();
    
    const data = await request.json();
    const {
      studentId,
      examTitle,
      examType,
      examDate,
      subjects,
      generatedBy,
      principalSignature,
      classTeacherSignature,
      rank
    } = data;
    
    // Validate required fields
    if (!studentId || !examTitle || !examType || !examDate || !subjects || !generatedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Check if marksheet already exists for this student and exam
    const existingMarksheet = await StudentMarksheet.findOne({
      studentId,
      examTitle,
      examType
    });
    
    if (existingMarksheet) {
      return NextResponse.json(
        { success: false, error: 'Marksheet already exists for this exam' },
        { status: 409 }
      );
    }
    
    // Create new marksheet
    const newMarksheet = new StudentMarksheet({
      studentId,
      studentName: student.name,
      rollNumber: student.rollNo,
      class: student.class,
      section: student.section,
      examTitle,
      examType,
      examDate: new Date(examDate),
      subjects,
      generatedBy,
      principalSignature: principalSignature || '',
      classTeacherSignature: classTeacherSignature || '',
      rank: rank || ''
    });
    
    // Save marksheet (calculations will be done in pre-save middleware)
    const savedMarksheet = await newMarksheet.save();
    
    // Populate student details for response
    await savedMarksheet.populate('studentId', 'name rollNo class section mobileNo');
    
    return NextResponse.json({
      success: true,
      data: savedMarksheet,
      message: 'Marksheet created successfully'
    });
    
  } catch (error: any) {
    console.error('Error creating marksheet:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create marksheet',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing marksheet
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Marksheet ID is required' },
        { status: 400 }
      );
    }
    
    const updatedMarksheet = await StudentMarksheet.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('studentId', 'name rollNo class section mobileNo');
    
    if (!updatedMarksheet) {
      return NextResponse.json(
        { success: false, error: 'Marksheet not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedMarksheet,
      message: 'Marksheet updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating marksheet:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update marksheet',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete marksheet
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Marksheet ID is required' },
        { status: 400 }
      );
    }
    
    const deletedMarksheet = await StudentMarksheet.findByIdAndDelete(id);
    
    if (!deletedMarksheet) {
      return NextResponse.json(
        { success: false, error: 'Marksheet not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Marksheet deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting marksheet:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete marksheet',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';