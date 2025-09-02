import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { role, count = 35 } = await request.json();

    const systemPrompt = `Generate ${count} multiple choice questions for a ${role} technical assessment. 

Requirements:
- Mix of medium (60%) and hard (40%) difficulty questions
- Categories: Technical Knowledge, Problem Solving, Coding Logic, System Design, Best Practices
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Include detailed explanation for correct answer
- Questions should be practical and job-relevant
- No basic/easy questions - focus on mid to advanced level

Return JSON array with this exact structure:
[
  {
    "id": 1,
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct",
    "difficulty": "medium",
    "category": "Technical Knowledge"
  }
]`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${count} technical interview questions for ${role} position. Focus on practical scenarios, coding concepts, algorithms, system design, and best practices. Make questions challenging but fair.` }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.8,
      max_tokens: 8000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    let questions;
    try {
      questions = JSON.parse(response);
    } catch (parseError) {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format');
    }

    // Validate that we have real questions, not placeholders
    const validQuestions = questions.filter(q => 
      q.question && 
      q.question.length > 20 && 
      !q.question.includes('Question ') &&
      Array.isArray(q.options) && 
      q.options.length === 4 &&
      q.options.every((opt: string) => opt && opt.length > 3)
    );

    if (validQuestions.length < count * 0.8) {
      throw new Error('AI generated insufficient quality questions');
    }

    const validatedQuestions = validQuestions.slice(0, count).map((q, index) => ({
      id: index + 1,
      question: q.question,
      options: q.options,
      correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3 ? q.correctAnswer : 0,
      explanation: q.explanation || 'Explanation not provided',
      difficulty: ['medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      category: q.category || 'Technical Knowledge'
    }));

    return NextResponse.json({ questions: validatedQuestions });
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}