import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, eventType, eventData } = await request.json();

    // Log proctoring event
    await db.execute(
      'INSERT INTO proctoring_logs (user_id, session_id, event_type, event_data) VALUES (?, ?, ?, ?)',
      [user.id, sessionId || 'default-session', eventType || 'unknown', JSON.stringify(eventData || {})]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Proctoring log error:', error);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}