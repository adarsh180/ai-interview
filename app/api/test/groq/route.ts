import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET() {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "Groq API is working!" in JSON format with a success field.' }],
      model: 'llama3-8b-8192',
      temperature: 0.1,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content || 'No response';

    return NextResponse.json({ 
      success: true, 
      response,
      model: 'llama3-8b-8192',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Groq API test error:', error);
    return NextResponse.json({ 
      error: 'Groq API test failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}