import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Attendance from '@/lib/modals/attendance';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'teacher'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const klass = searchParams.get('class');
    const section = searchParams.get('section');
    const subject = searchParams.get('subject');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD

    if (!klass || !section || !subject || !dateStr) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    await connectToDatabase();
    const dateOnly = new Date(`${dateStr}T00:00:00.000Z`);
    const nextDate = new Date(dateOnly);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const doc = await Attendance.findOne({
      class: klass,
      section,
      subject,
      date: { $gte: dateOnly, $lt: nextDate },
    }).lean();

    return NextResponse.json({ attendance: doc ?? null });
  } catch (e) {
    console.error('GET /api/attendance error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

type StudentEntry = {
  studentId: string;
  status: 'Present' | 'Absent';
  remarks?: string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'teacher'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { class: klass, section, subject, date, students } = body as {
      class: string; section: string; subject: string; date: string; students: StudentEntry[];
    };

    if (!klass || !section || !subject || !date || !Array.isArray(students)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await connectToDatabase();

    const dateOnly = new Date(`${date}T00:00:00.000Z`);

    // Normalize & validate student ids
    const normalizedStudents = students.map((s) => ({
      studentId: new mongoose.Types.ObjectId(s.studentId),
      status: s.status,
      remarks: s.remarks ?? '',
    }));

    const filter = { class: klass, section, subject, date: dateOnly };
    const update = {
      $set: {
        class: klass,
        section,
        subject,
        date: dateOnly,
        markedBy: new mongoose.Types.ObjectId((session.user as any).id),
        students: normalizedStudents,
      },
    };

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const doc = await Attendance.findOneAndUpdate(filter, update, options);

    return NextResponse.json({ success: true, attendanceId: doc._id });
  } catch (e) {
    console.error('POST /api/attendance error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
