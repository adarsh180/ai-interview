import Groq from 'groq-sdk';

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development' && !process.env.GROQ_API_KEY) {
  console.warn('GROQ_API_KEY environment variable is required');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function parseResume(resumeText: string) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const prompt = `Extract information from this resume and return ONLY a JSON object. No explanations, no markdown, just pure JSON.

Required JSON structure:
{
  "name": "Full Name",
  "email": "email@example.com", 
  "phone": "phone number",
  "skills": ["skill1", "skill2"],
  "experience": [{"company": "Company", "role": "Title", "duration": "2020-2023", "description": "Brief description"}],
  "education": [{"institution": "University", "degree": "Bachelor's", "field": "Computer Science", "year": "2020"}],
  "projects": [{"name": "Project Name", "description": "Brief description", "technologies": ["tech1", "tech2"], "type": "personal/academic/professional"}],
  "certifications": ["Certification Name"],
  "summary": "Professional summary"
}

Resume text:
${resumeText.substring(0, 4000)}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 2500,
    });

    const content = completion.choices[0]?.message?.content || '{}';

    // Clean the response to ensure it's valid JSON
    let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Remove any text before the first { and after the last }
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
    }

    try {
      const parsed = JSON.parse(cleanContent);

      // Validate and provide defaults
      return {
        name: parsed.name || 'Unknown',
        email: parsed.email || '',
        phone: parsed.phone || '',
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        summary: parsed.summary || 'No summary available'
      };
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      console.error('Raw content:', content);
      console.error('Cleaned content:', cleanContent);
      throw new Error('Failed to parse AI response as JSON');
    }
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw error;
  }
}

export async function calculateFitScore(resumeData: any, jobConfig: any) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const { role, experienceLevel, yearsOfExperience, company, specificRequirements } = jobConfig;

    // Create experience level context with proper typing
    const experienceContext: Record<string, string> = {
      fresher: "0-1 years experience, focus on potential, learning ability, projects, and academic achievements",
      junior: "1-3 years experience, basic professional skills, some real-world experience",
      mid: "3-5 years experience, solid professional skills, proven track record",
      senior: "5-8 years experience, advanced skills, leadership potential, complex problem solving",
      lead: "8+ years experience, expert-level skills, leadership, mentoring, strategic thinking"
    };

    // Company tier classification for evaluation standards
    const companyTiers: Record<string, { tier: string; standards: string }> = {
      // Tier 1: Big Tech & Top MNCs
      'google': { tier: 'Tier 1', standards: 'Extremely high standards, exceptional problem-solving, system design expertise, strong CS fundamentals, competitive programming background preferred' },
      'microsoft': { tier: 'Tier 1', standards: 'Very high standards, strong technical depth, leadership qualities, innovation mindset, proven track record' },
      'apple': { tier: 'Tier 1', standards: 'Exceptional standards, attention to detail, user-centric thinking, technical excellence, design sensibility' },
      'amazon': { tier: 'Tier 1', standards: 'High standards, customer obsession, ownership mentality, scalability thinking, leadership principles' },
      'meta': { tier: 'Tier 1', standards: 'Very high standards, fast-paced environment, impact-driven, technical depth, social impact awareness' },
      'netflix': { tier: 'Tier 1', standards: 'Extremely high performance standards, freedom and responsibility culture, senior-level expectations' },
      'tesla': { tier: 'Tier 1', standards: 'High standards, innovation focus, fast execution, mission-driven, technical excellence' },
      'reliance': { tier: 'Tier 1', standards: 'High standards for Indian market leader, business acumen, scale thinking, diverse domain knowledge' },
      'tata': { tier: 'Tier 1', standards: 'Strong standards, ethical leadership, business understanding, long-term thinking' },
      
      // Tier 2: Established Tech Companies
      'uber': { tier: 'Tier 2', standards: 'Good standards, real-world problem solving, scalability awareness, business impact focus' },
      'airbnb': { tier: 'Tier 2', standards: 'Good standards, user experience focus, community building, global perspective' },
      'spotify': { tier: 'Tier 2', standards: 'Good standards, creative problem solving, user engagement focus, data-driven approach' },
      'linkedin': { tier: 'Tier 2', standards: 'Good standards, professional network understanding, B2B focus, relationship building' },
      'salesforce': { tier: 'Tier 2', standards: 'Good standards, enterprise software experience, customer success focus, cloud expertise' },
      
      // Tier 3: Growing Companies & Unicorns
      'zomato': { tier: 'Tier 3', standards: 'Moderate standards, local market understanding, growth mindset, adaptability' },
      'swiggy': { tier: 'Tier 3', standards: 'Moderate standards, operational efficiency, customer service focus, rapid scaling experience' },
      'paytm': { tier: 'Tier 3', standards: 'Moderate standards, fintech knowledge, regulatory awareness, user adoption focus' },
      'flipkart': { tier: 'Tier 3', standards: 'Moderate standards, e-commerce experience, Indian market knowledge, customer-centric approach' },
      'ola': { tier: 'Tier 3', standards: 'Moderate standards, mobility solutions, real-time systems, local market adaptation' },
      'byju': { tier: 'Tier 3', standards: 'Moderate standards, edtech focus, content creation, learning psychology understanding' },
      
      // Default for unlisted companies
      'startup': { tier: 'Startup', standards: 'Flexible standards, adaptability, multi-tasking ability, growth potential, learning agility' },
      'default': { tier: 'Standard', standards: 'Standard industry requirements, relevant skills, good communication, team collaboration' }
    };

    // Get company standards
    const companyKey = company?.toLowerCase() || 'default';
    const companyInfo = companyTiers[companyKey] || companyTiers['default'];
    
    // Adjust standards based on experience level and company tier
    let evaluationStandards = '';
    if (companyInfo.tier === 'Tier 1') {
      evaluationStandards = experienceLevel === 'fresher' 
        ? 'Very high standards even for freshers: exceptional academic projects, competitive programming, strong fundamentals, internship experience at reputable companies, open source contributions'
        : 'Extremely high standards: proven expertise, system design skills, leadership experience, significant impact in previous roles, thought leadership';
    } else if (companyInfo.tier === 'Tier 2') {
      evaluationStandards = experienceLevel === 'fresher'
        ? 'High standards for freshers: good academic projects, some practical experience, strong technical skills, learning agility'
        : 'High standards: solid technical skills, proven track record, good problem-solving abilities, team collaboration';
    } else if (companyInfo.tier === 'Tier 3') {
      evaluationStandards = experienceLevel === 'fresher'
        ? 'Moderate standards for freshers: relevant projects, basic technical skills, enthusiasm to learn, cultural fit'
        : 'Moderate standards: relevant experience, good technical foundation, adaptability, growth mindset';
    } else {
      evaluationStandards = experienceLevel === 'fresher'
        ? 'Standard requirements: basic technical skills, some projects, willingness to learn'
        : 'Standard requirements: relevant experience, technical competency, team fit';
    }

    // Get experience context with fallback
    const experienceLevelContext = experienceContext[experienceLevel] || experienceContext['mid'];

    const prompt = `You are an expert HR analyst evaluating a candidate for ${company || 'a company'} (${companyInfo.tier}). 

COMPANY CONTEXT: ${companyInfo.standards}
EVALUATION STANDARDS: ${evaluationStandards}

IMPORTANT GUIDELINES:
- Do NOT favor any specific degree or university - evaluate based on skills and achievements
- Value practical skills, projects, and real-world experience highly
- For freshers, emphasize projects, internships, hackathons, and learning potential
- Consider alternative education paths (bootcamps, self-taught, online courses) as equally valid
- Evaluate projects based on complexity, technologies used, and business relevance
- Be fair but adjust expectations based on company tier and role level

Expected for ${experienceLevel} level: ${experienceLevelContext}

Return ONLY JSON:
{
  "score": 85,
  "breakdown": {
    "skills_match": 80,
    "experience_match": 75,
    "education_match": 70,
    "projects_match": 90
  },
  "strengths": [
    "Strong project portfolio with relevant technologies",
    "Demonstrates practical application of skills"
  ],
  "gaps": [
    "Could benefit from more experience with X",
    "Consider learning Y for this role"
  ],
  "suggestions": [
    "Build more projects using technology X",
    "Consider contributing to open source projects"
  ]
}

CANDIDATE PROFILE:
Name: ${resumeData.name}
Skills: ${JSON.stringify(resumeData.skills)}
Experience: ${JSON.stringify(resumeData.experience)}
Education: ${JSON.stringify(resumeData.education)}
Projects: ${JSON.stringify(resumeData.projects)}
Certifications: ${JSON.stringify(resumeData.certifications)}
${specificRequirements ? `Specific Requirements: ${specificRequirements.join(', ')}` : ''}

Target Role: ${role} at ${company || 'Company'} (${experienceLevel} level, ${yearsOfExperience} years)`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '{}';

    // Clean the response to ensure it's valid JSON
    let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Remove any text before the first { and after the last }
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
    }

    try {
      const parsed = JSON.parse(cleanContent);

      // Validate and provide defaults
      return {
        score: Math.min(100, Math.max(0, parsed.score || 0)),
        breakdown: {
          skills_match: Math.min(100, Math.max(0, parsed.breakdown?.skills_match || 0)),
          experience_match: Math.min(100, Math.max(0, parsed.breakdown?.experience_match || 0)),
          education_match: Math.min(100, Math.max(0, parsed.breakdown?.education_match || 0)),
          projects_match: Math.min(100, Math.max(0, parsed.breakdown?.projects_match || 0))
        },
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps : ['Analysis not available'],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : ['Please try again for suggestions']
      };
    } catch (jsonError) {
      console.error('JSON parsing error for fit score:', jsonError);
      console.error('Raw content:', content);
      console.error('Cleaned content:', cleanContent);
      throw new Error('Failed to parse AI response as JSON');
    }
  } catch (error) {
    console.error('Fit score calculation error:', error);
    throw error;
  }
}

export async function generateInterviewQuestions(role: string, level: string = 'mid') {
  const prompt = `Generate 5 interview questions for a ${level}-level ${role} position. Include 2 technical, 2 behavioral, 1 system design. Return JSON array with: question, type, difficulty, expected_points.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
  });

  return JSON.parse(completion.choices[0]?.message?.content || '[]');
}

export async function evaluateAnswer(question: string, answer: string, role: string) {
  const prompt = `Evaluate this interview answer for a ${role} position. Question: "${question}" Answer: "${answer}". Return JSON with: score (0-10), feedback, strengths (array), improvements (array).`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.2,
  });

  return JSON.parse(completion.choices[0]?.message?.content || '{}');
}

export async function reviewCode(code: string, language: string, problem: string) {
  const prompt = `Review this ${language} code for the problem: "${problem}". Code: ${code}. Return JSON with: score (0-10), correctness, efficiency, style_issues (array), suggestions (array), complexity.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.1,
  });

  return JSON.parse(completion.choices[0]?.message?.content || '{}');
}