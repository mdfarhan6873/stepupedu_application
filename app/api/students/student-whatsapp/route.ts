import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import StudentWhatsapp from '@/lib/modals/studentWhatsapp';
import Student from '@/lib/modals/student';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get student details to fetch class and section
    const student = await Student.findOne({ mobileNo: session.user.mobileNo });
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Find WhatsApp group for the student's class and section
    const whatsappGroup = await StudentWhatsapp.findOne({
      class: student.class,
      section: student.section,
      isActive: true
    });

    if (!whatsappGroup) {
      return NextResponse.json({ error: 'No WhatsApp group found for your class' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        groupName: whatsappGroup.groupName,
        class: whatsappGroup.class,
        section: whatsappGroup.section,
        groupLink: whatsappGroup.groupLink,
        description: whatsappGroup.description
      }
    });

  } catch (error) {
    console.error('Error fetching student WhatsApp group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}