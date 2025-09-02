import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Fetch problems from database
    const [problemRows] = await db.execute(`
      SELECT p.*, 
             false as solved,
             false as attempted
      FROM problems p
      ORDER BY p.id ASC
    `);

    const problems = (problemRows as any[]).map(row => ({
      id: row.id,
      title: row.title,
      difficulty: row.difficulty,
      topic: row.topic,
      description: row.description,
      examples: typeof row.examples === 'string' ? JSON.parse(row.examples || '[]') : (row.examples || []),
      constraints: typeof row.constraints === 'string' ? JSON.parse(row.constraints || '[]') : (row.constraints || []),
      testCases: typeof row.test_cases === 'string' ? JSON.parse(row.test_cases || '[]') : (row.test_cases || []),
      solutionTemplate: typeof row.solution_template === 'string' ? JSON.parse(row.solution_template || '{}') : (row.solution_template || {}),
      companies: typeof row.companies === 'string' ? JSON.parse(row.companies || '[]') : (row.companies || []),
      acceptanceRate: row.acceptance_rate || 0,
      likes: row.likes || 0,
      dislikes: row.dislikes || 0,
      solved: Boolean(row.solved),
      attempted: Boolean(row.attempted)
    }));

    return NextResponse.json({ problems });
  } catch (error) {
    console.error('Problems fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
  }
}