// api/admin/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Student from '@/lib/modals/student';
import bcrypt from 'bcryptjs';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { 
      name, 
      class: studentClass, 
      section, 
      rollNo, 
      mobileNo, 
      password,
      parentName, 
      parentMobileNo, 
      address 
    } = body;

    // Validate required fields
    if (!name || !studentClass || !section || !rollNo || !mobileNo || !parentName || !parentMobileNo || !address) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if another student has the same roll number in the same class and section
    const existingStudent = await Student.findOne({
      _id: { $ne: params.id }, // Exclude current student
      rollNo,
      class: studentClass,
      section
    });

    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: 'A student with this roll number already exists in this class and section' },
        { status: 400 }
      );
    }

    // Check if another student has the same mobile number
    const existingMobile = await Student.findOne({
      _id: { $ne: params.id }, // Exclude current student
      mobileNo
    });

    if (existingMobile) {
      return NextResponse.json(
        { success: false, error: 'A student with this mobile number already exists' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      class: studentClass,
      section,
      rollNo: rollNo.trim(),
      mobileNo: mobileNo.trim(),
      parentName: parentName.trim(),
      parentMobileNo: parentMobileNo.trim(),
      address: address.trim()
    };

    // Only update password if provided and hash it
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password.trim(), 12);
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed. Please check your input.' },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Duplicate data found. Please check roll number and mobile number.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const deletedStudent = await Student.findByIdAndDelete(params.id);
    
    if (!deletedStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
      data: deletedStudent
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}