import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user details from database
    const [rows] = await db.execute(
      'SELECT id, name, email, is_admin, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = rows[0] as any;
    
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
      role: user.is_admin ? 'admin' : 'user',
      created_at: user.created_at
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}