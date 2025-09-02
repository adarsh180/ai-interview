import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

// GET - Fetch all problems for admin
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin
    const [userRows] = await db.execute(
      'SELECT is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!Array.isArray(userRows) || userRows.length === 0 || !(userRows[0] as any).is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [rows] = await db.execute(`
      SELECT id, title, difficulty, topic, description, examples, constraints, 
             test_cases, solution_template, companies, acceptance_rate, likes, dislikes,
             created_at
      FROM problems 
      ORDER BY created_at DESC
    `);

    const problems = (rows as any[]).map(row => ({
      ...row,
      examples: typeof row.examples === 'string' ? JSON.parse(row.examples || '[]') : (row.examples || []),
      constraints: typeof row.constraints === 'string' ? JSON.parse(row.constraints || '[]') : (row.constraints || []),
      test_cases: typeof row.test_cases === 'string' ? JSON.parse(row.test_cases || '[]') : (row.test_cases || []),
      solution_template: typeof row.solution_template === 'string' ? JSON.parse(row.solution_template || '{}') : (row.solution_template || {}),
      companies: typeof row.companies === 'string' ? JSON.parse(row.companies || '[]') : (row.companies || [])
    }));

    return NextResponse.json({ problems });
  } catch (error) {
    console.error('Admin problems fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
  }
}

// POST - Create new problem
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin
    const [userRows] = await db.execute(
      'SELECT is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!Array.isArray(userRows) || userRows.length === 0 || !(userRows[0] as any).is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const problemData = await request.json();
    console.log('Received problem data:', problemData);

    // Validate required fields
    if (!problemData.title || !problemData.difficulty || !problemData.topic || !problemData.description) {
      return NextResponse.json({ error: 'Missing required fields: title, difficulty, topic, description' }, { status: 400 });
    }

    const [result] = await db.execute(`
      INSERT INTO problems (
        title, difficulty, topic, description, examples, constraints,
        test_cases, solution_template, companies, acceptance_rate, likes, dislikes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      problemData.title,
      problemData.difficulty,
      problemData.topic,
      problemData.description,
      JSON.stringify(problemData.examples || []),
      JSON.stringify(problemData.constraints || []),
      JSON.stringify(problemData.testCases || []),
      JSON.stringify(problemData.solutionTemplate || {}),
      JSON.stringify(problemData.companies || []),
      problemData.acceptanceRate || 0,
      problemData.likes || 0,
      problemData.dislikes || 0
    ]);

    console.log('Problem created successfully with ID:', (result as any).insertId);

    return NextResponse.json({ 
      success: true, 
      problemId: (result as any).insertId,
      message: 'Problem created successfully' 
    });
  } catch (error) {
    console.error('Problem creation error:', error);
    return NextResponse.json({ error: 'Failed to create problem' }, { status: 500 });
  }
}