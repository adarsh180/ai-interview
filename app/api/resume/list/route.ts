import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [rows] = await db.execute(
      'SELECT id, filename, parsed_data, confidence_score, created_at FROM resumes WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );

    return NextResponse.json({ resumes: rows });
  } catch (error) {
    console.error('Resume list error:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}