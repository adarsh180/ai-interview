import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

// GET - Fetch all users for admin
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin
    const [userRows] = await db.execute(
      'SELECT is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!Array.isArray(userRows) || userRows.length === 0 || !(userRows[0] as any).is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [rows] = await db.execute(`
      SELECT id, name, email, role, is_admin, created_at
      FROM users 
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}