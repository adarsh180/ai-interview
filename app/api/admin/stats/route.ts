import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    // Check if user is admin
    const [adminCheck] = await connection.execute(
      'SELECT is_admin FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (!(adminCheck[0] as any)?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get statistics
    const [totalUsers] = await connection.execute('SELECT COUNT(*) as count FROM users') as any[];
    const [totalProblems] = await connection.execute('SELECT COUNT(*) as count FROM problems') as any[];
    const [totalSubmissions] = await connection.execute('SELECT COUNT(*) as count FROM coding_sessions') as any[];
    const [activeToday] = await connection.execute(
      'SELECT COUNT(DISTINCT user_id) as count FROM coding_sessions WHERE DATE(submission_time) = CURDATE()'
    ) as any[];

    return NextResponse.json({
      totalUsers: (totalUsers[0] as any).count,
      totalProblems: (totalProblems[0] as any).count,
      totalSubmissions: (totalSubmissions[0] as any).count,
      activeToday: (activeToday[0] as any).count
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}