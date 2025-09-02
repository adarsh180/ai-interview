import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Find user
    const [users] = await db.execute(
      'SELECT id, email, name, password, role, is_admin FROM users WHERE email = ?',
      [email]
    );

    const user = (users as any[])[0];
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate token
    const userInfo = { id: user.id, email: user.email, name: user.name, role: user.role, is_admin: user.is_admin };
    const token = generateToken(userInfo);

    return NextResponse.json({ token, user: userInfo });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}