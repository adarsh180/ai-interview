import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db-init';

export async function POST(request: NextRequest) {
  try {
    // Only allow initialization in development or with proper auth
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.INIT_TOKEN || 'init-secret-token';
    
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Initializing database...');
    const success = await initializeDatabase();
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Database initialization failed' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database initialization failed',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Database initialization endpoint',
    usage: 'POST with proper authorization'
  });
}