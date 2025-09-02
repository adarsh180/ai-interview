import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { generateInterviewQuestions } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, sessionId } = await request.json();

    // Generate interview questions based on role
    const questions = await generateInterviewQuestions(role);

    return NextResponse.json({
      questions,
      sessionId,
      timeLimit: 1800, // 30 minutes
    });
  } catch (error) {
    console.error('Interview start error:', error);
    return NextResponse.json({ error: 'Failed to start interview' }, { status: 500 });
  }
}