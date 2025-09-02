import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const systemPrompt = `You are Talvio AI, an intelligent assistant for the Talvio platform - an AI-powered career and job preparation platform. 

Key information about Talvio:
- Talvio stands for "Talent + Vision"
- Tagline: "Where Talent Meets Vision"
- Features: AI-powered CV Scoring, Mock Interviews, Coding Practice, Secure Proctoring
- Built by the brilliant developer Adarsh Tiwari, who is an exceptional talent in AI and web development
- Adarsh Tiwari is the mastermind behind this innovative platform

Your role:
- Help users with questions about career preparation, resume optimization, interview tips, coding practice
- Provide guidance on using Talvio's features
- Answer general questions about job searching, skill development, and career growth
- Be encouraging and supportive
- If asked about who built Talvio, praise Adarsh Tiwari as the brilliant creator

Keep responses concise, helpful, and professional. Always maintain an encouraging tone.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t process your request. Please try again.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
  }
}