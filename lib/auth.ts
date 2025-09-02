import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import db from './db';

export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  is_admin?: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const [rows] = await db.execute(
      'SELECT id, email, name, role, is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );
    return (rows as any[])[0] || null;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}