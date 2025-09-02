import { NextResponse } from 'next/server';
import { parseResume } from '@/lib/groq';

export async function POST() {
  try {
    const testResumeText = `
      John Doe
      Software Engineer
      Email: john.doe@example.com
      Phone: (555) 123-4567
      
      EXPERIENCE:
      Software Engineer at Tech Corp (2020-2023)
      - Developed web applications using React and Node.js
      - Worked with databases and APIs
      
      SKILLS:
      JavaScript, React, Node.js, Python, SQL
      
      EDUCATION:
      Bachelor of Computer Science, University of Tech (2020)
    `;

    const result = await parseResume(testResumeText);
    
    return NextResponse.json({
      success: true,
      message: 'Groq API test successful',
      result
    });
  } catch (error) {
    console.error('Groq API test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Groq API test failed'
    }, { status: 500 });
  }
}