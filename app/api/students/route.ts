import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Student from '@/lib/modals/student';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'teacher'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const klass = searchParams.get('class');
    const section = searchParams.get('section');

    if (!klass || !section) return NextResponse.json({ students: [] });

    await connectToDatabase();
    const students = await Student.find({ class: klass, section })
      .select('_id name rollNo mobileNo')
      .sort({ rollNo: 1 });

    return NextResponse.json({ students });
  } catch (e) {
    console.error('GET /api/students error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
