import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Add is_admin column if it doesn't exist
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE`);
    } catch (error) {
      // Column might already exist
    }

    // Hash the admin password
    const adminPassword = await bcrypt.hash('Adarsh0704##', 12);

    // Delete existing admin user if exists
    await db.execute(`DELETE FROM users WHERE email = 'tiwariadarsh1804@gmail.com'`);

    // Create admin user
    await db.execute(`
      INSERT INTO users (email, password, name, role, is_admin)
      VALUES (?, ?, 'Admin', 'admin', TRUE)
    `, ['tiwariadarsh1804@gmail.com', adminPassword]);

    return NextResponse.json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}