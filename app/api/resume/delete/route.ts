import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Check if the resume belongs to the user
    const [resumeRows] = await db.execute(
      'SELECT user_id FROM resumes WHERE id = ?',
      [resumeId]
    );

    if (!Array.isArray(resumeRows) || resumeRows.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const resume = resumeRows[0] as any;
    if (resume.user_id !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this resume' }, { status: 403 });
    }

    // Delete the resume
    await db.execute('DELETE FROM resumes WHERE id = ?', [resumeId]);

    return NextResponse.json({ 
      success: true, 
      message: 'Resume analysis deleted successfully' 
    });

  } catch (error) {
    console.error('Resume deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete resume analysis',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}