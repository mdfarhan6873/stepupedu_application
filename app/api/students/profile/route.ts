import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Student from '@/lib/modals/student';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const student = await Student.findById(session.user.id).select('-password');
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('GET /api/students/profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { field, value, currentPassword } = body;

    if (!field || !value) {
      return NextResponse.json({ error: 'Field and value are required' }, { status: 400 });
    }

    // Validate allowed fields
    const allowedFields = ['mobileNo', 'password', 'class', 'section'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    await connectToDatabase();
    const student = await Student.findById(session.user.id).select('+password');
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // For password change, verify current password
    if (field === 'password') {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }
      
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, student.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(value, 12);
      student.password = hashedPassword;
    } else if (field === 'mobileNo') {
      // Check if mobile number is already taken by another student
      const existingStudent = await Student.findOne({ 
        mobileNo: value, 
        _id: { $ne: session.user.id } 
      });
      
      if (existingStudent) {
        return NextResponse.json({ error: 'Mobile number already exists' }, { status: 400 });
      }
      
      student.mobileNo = value;
    } else {
      // For class and section
      student[field] = value;
    }

    await student.save();

    // Return updated student without password
    const updatedStudent = await Student.findById(session.user.id).select('-password');
    return NextResponse.json({ 
      message: `${field} updated successfully`, 
      student: updatedStudent 
    });

  } catch (error) {
    console.error('PATCH /api/students/profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}