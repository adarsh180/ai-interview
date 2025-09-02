import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin
    const [adminCheck] = await db.execute(
      'SELECT is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!Array.isArray(adminCheck) || adminCheck.length === 0 || !(adminCheck[0] as any).is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get user progress data
    const [progressData] = await db.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.created_at,
        0 as total_attempts,
        0 as problems_solved,
        COUNT(DISTINCT r.id) as resumes_uploaded,
        AVG(r.confidence_score) as avg_ats_score,
        u.created_at as last_activity
      FROM users u
      LEFT JOIN resumes r ON u.id = r.user_id
      WHERE u.is_admin = 0
      GROUP BY u.id, u.name, u.email, u.created_at
      ORDER BY u.created_at DESC
    `);

    // Get daily activity for the last 30 days
    const [dailyActivity] = await db.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as activity_count
      FROM resumes 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    return NextResponse.json({
      users: progressData,
      dailyActivity: dailyActivity
    });

  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch progress data',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}