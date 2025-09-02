import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { problemId, language, code, testResults } = await request.json();

    const score = testResults.allPassed ? 100 : Math.floor((testResults.passed / testResults.total) * 100);

    await db.execute(`
      INSERT INTO coding_sessions (user_id, problem_id, language, code, test_results, score)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [decoded.userId, problemId, language, code, JSON.stringify(testResults), score]);

    return NextResponse.json({ 
      success: true, 
      score,
      message: score === 100 ? 'Congratulations! Problem solved!' : 'Keep trying!'
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Failed to submit solution' }, { status: 500 });
  }
}