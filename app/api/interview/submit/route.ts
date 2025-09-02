import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { role, questions, answers, timeSpent } = await request.json();

    // Calculate results
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    questions.forEach((question: any, index: number) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;

    // Save to database
    await db.execute(
      `INSERT INTO interviews (user_id, role, questions, answers, score) 
       VALUES (?, ?, ?, ?, ?)`,
      [decoded.userId, role, JSON.stringify(questions), JSON.stringify(answers), score]
    );

    const results = {
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      answers
    };

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Submit interview error:', error);
    return NextResponse.json({ error: 'Failed to submit interview' }, { status: 500 });
  }
}