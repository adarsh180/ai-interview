import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import jwt from 'jsonwebtoken';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    const { code, language, problemTitle, problemDescription } = await request.json();

    if (!code || !language || !problemTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const analysisPrompt = `
You are an expert coding mentor and algorithm specialist. Analyze the following code submission and provide comprehensive feedback.

**Problem:** ${problemTitle}
**Description:** ${problemDescription}

**Submitted Code (${language}):**
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed analysis in the following JSON format:
{
  "correctness": {
    "score": 0-100,
    "explanation": "detailed explanation of correctness",
    "issues": ["list of issues found"]
  },
  "timeComplexity": {
    "current": "O(n) notation",
    "optimal": "O(n) notation", 
    "explanation": "detailed complexity analysis"
  },
  "spaceComplexity": {
    "current": "O(n) notation",
    "optimal": "O(n) notation",
    "explanation": "detailed space analysis"
  },
  "codeQuality": {
    "score": 0-100,
    "strengths": ["list of good practices"],
    "improvements": ["list of suggested improvements"]
  },
  "approach": {
    "description": "explanation of the approach used",
    "isOptimal": true/false,
    "alternativeApproaches": ["list of alternative approaches"]
  },
  "optimizedSolution": {
    "code": "optimized version of the code",
    "explanation": "why this is better"
  },
  "learningPoints": ["key concepts to understand"],
  "overallScore": 0-100,
  "feedback": "encouraging and constructive feedback"
}

Focus on:
1. Algorithm correctness and edge cases
2. Time and space complexity analysis
3. Code readability and best practices
4. Optimization opportunities
5. Alternative approaches and trade-offs
6. Educational insights and learning opportunities

Be encouraging but precise in your analysis.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert coding mentor. Provide detailed, educational, and encouraging code analysis in valid JSON format."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      model: "llama-3.1-70b-versatile",
      temperature: 0.3,
      max_tokens: 2000,
    });

    const analysisText = completion.choices[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Try to parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      analysis = {
        correctness: { score: 75, explanation: "Code analysis completed", issues: [] },
        timeComplexity: { current: "O(n)", optimal: "O(n)", explanation: analysisText },
        spaceComplexity: { current: "O(1)", optimal: "O(1)", explanation: "Space analysis" },
        codeQuality: { score: 80, strengths: ["Good structure"], improvements: ["Add comments"] },
        approach: { description: analysisText, isOptimal: true, alternativeApproaches: [] },
        optimizedSolution: { code: code, explanation: "Current solution is good" },
        learningPoints: ["Algorithm understanding", "Code optimization"],
        overallScore: 78,
        feedback: analysisText
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Code analysis error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze code',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}