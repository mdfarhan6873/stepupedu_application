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
    if (!klass) return NextResponse.json({ sections: [] });

    await connectToDatabase();
    const sections = await Student.distinct('section', { class: klass });
    return NextResponse.json({ sections: sections.sort() });
  } catch (e) {
    console.error('GET /api/sections error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
