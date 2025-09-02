import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function POST() {
  try {
    await initDB();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 });
  }
}