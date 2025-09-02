import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { reviewCode } from '@/lib/groq';
import db from '@/lib/db';

// Mock code execution for demo - in production, use Docker sandbox
const executeCode = async (code: string, language: string, problemId: string) => {
  // Simulate test case execution
  const testCases = [
    { input: '[2,7,11,15], 9', expected: '[0,1]' },
    { input: '[3,2,4], 6', expected: '[1,2]' },
    { input: '[3,3], 6', expected: '[0,1]' }
  ];

  // Mock results - in production, run actual code in sandbox
  const results = testCases.map((testCase, index) => ({
    input: testCase.input,
    expected: testCase.expected,
    actual: index < 2 ? testCase.expected : '[1,0]', // Mock: first 2 pass, last fails
    passed: index < 2,
    executionTime: Math.random() * 100,
    memoryUsed: Math.random() * 1000
  }));

  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;

  return {
    results,
    allPassed,
    passedCount,
    totalCount: results.length,
    executionTime: Math.max(...results.map(r => r.executionTime)),
    memoryUsed: Math.max(...results.map(r => r.memoryUsed))
  };
};

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, language, problemId } = await request.json();

    if (!code || !language || !problemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Execute code (mock implementation)
    const executionResults = await executeCode(code, language, problemId);

    // Get AI code review
    const aiReview = await reviewCode(code, language, problemId);

    // Calculate score based on test results and AI review
    const testScore = (executionResults.passedCount / executionResults.totalCount) * 100;
    const finalScore = (testScore + (aiReview.score * 10)) / 2;

    // Save coding session
    await db.execute(
      'INSERT INTO coding_sessions (user_id, language, problem_id, code, test_results, score, feedback) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        user.id,
        language,
        problemId,
        code,
        JSON.stringify(executionResults),
        finalScore,
        JSON.stringify(aiReview)
      ]
    );

    return NextResponse.json({
      ...executionResults,
      aiReview,
      finalScore
    });
  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json({ error: 'Failed to execute code' }, { status: 500 });
  }
}