import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

// PUT - Update problem
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const problemId = params.id;

    await db.execute(`
      UPDATE problems SET
        title = ?, difficulty = ?, topic = ?, description = ?, examples = ?,
        constraints = ?, test_cases = ?, solution_template = ?, companies = ?,
        acceptance_rate = ?, likes = ?, dislikes = ?
      WHERE id = ?
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
      problemData.dislikes || 0,
      problemId
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Problem updated successfully' 
    });
  } catch (error) {
    console.error('Problem update error:', error);
    return NextResponse.json({ error: 'Failed to update problem' }, { status: 500 });
  }
}

// DELETE - Delete problem
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const problemId = params.id;

    // Delete related coding sessions first
    await db.execute('DELETE FROM coding_sessions WHERE problem_id = ?', [problemId]);
    
    // Delete the problem
    await db.execute('DELETE FROM problems WHERE id = ?', [problemId]);

    return NextResponse.json({ 
      success: true, 
      message: 'Problem deleted successfully' 
    });
  } catch (error) {
    console.error('Problem deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete problem' }, { status: 500 });
  }
}