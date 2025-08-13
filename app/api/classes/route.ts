import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Student from '@/lib/modals/student';
import { auth } from '@/auth';

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'teacher'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const classes = await Student.distinct('class');
    return NextResponse.json({ classes: classes.sort() });
  } catch (e) {
    console.error('GET /api/classes error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
