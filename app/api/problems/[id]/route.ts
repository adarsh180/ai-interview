import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const problemId = params.id;

    const [rows] = await db.execute(
      'SELECT * FROM problems WHERE id = ?',
      [problemId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const problem = rows[0] as any;

    // Parse JSON fields safely
    const formattedProblem = {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      topic: problem.topic,
      description: problem.description,
      examples: typeof problem.examples === 'string' ? JSON.parse(problem.examples || '[]') : (problem.examples || []),
      constraints: typeof problem.constraints === 'string' ? JSON.parse(problem.constraints || '[]') : (problem.constraints || []),
      testCases: typeof problem.test_cases === 'string' ? JSON.parse(problem.test_cases || '[]') : (problem.test_cases || []),
      solutionTemplate: typeof problem.solution_template === 'string' ? JSON.parse(problem.solution_template || '{}') : (problem.solution_template || {}),
      companies: typeof problem.companies === 'string' ? JSON.parse(problem.companies || '[]') : (problem.companies || []),
      acceptanceRate: problem.acceptance_rate || 0,
      likes: problem.likes || 0,
      dislikes: problem.dislikes || 0,
      created_at: problem.created_at
    };

    return NextResponse.json({ problem: formattedProblem });

  } catch (error) {
    console.error('Problem fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch problem',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}