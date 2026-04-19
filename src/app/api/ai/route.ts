import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: Request) {
    if (!GROQ_API_KEY) {
        return NextResponse.json({ error: 'AI is not configured.' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { action } = body;

        if (action === 'chat') {
            const { messages } = body;
            const systemMessage = {
                role: 'system',
                content: `You are '1000Jobs AI Assistance', a helpful and friendly chatbot on the 1000Jobs website. Your purpose is to assist African youth in finding opportunities (jobs, grants, scholarships, training programs), answer questions about the platform, provide career advice, and give guidance on how to apply for opportunities. Do not mention that you are powered by Groq, OpenAI, or any other underlying technology. Just say you are the 1000Jobs AI Assistance.`
            };

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [systemMessage, ...messages],
                    temperature: 0.7,
                    max_tokens: 1024,
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Error from AI service');

            return NextResponse.json({ reply: data.choices[0].message.content });
        } 
        
        else if (action === 'generate_blog') {
            const { prompt } = body;
            const systemMessage = {
                role: 'system',
                content: `You are an AI assistant for 1000Jobs content administrators. Your job is to generate high-quality blog posts based on a prompt. Output the result in valid JSON format ONLY with the following structure:
{
  "title": "A catchy title",
  "excerpt": "A short, engaging summary (150-200 characters).",
  "content": "The full blog content in Markdown format, with headers (##), paragraphs, and lists where appropriate."
}`
            };

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [systemMessage, { role: 'user', content: prompt }],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Error from AI service');

            return NextResponse.json(JSON.parse(data.choices[0].message.content));
        }

        else if (action === 'extract_opportunity') {
            const { text } = body;
            const systemMessage = {
                role: 'system',
                content: `You are an AI assistant for 1000Jobs administrators. Your job is to extract opportunity details from unstructured text and return a valid JSON object. Extract or infer the following fields:
- title: The job, grant, or scholarship title.
- type: Must be one of ["Job", "Grant", "Scholarship", "Training"].
- company: The hiring organization or provider.
- location: Geographic area or "Remote".
- deadline: YYYY-MM-DD if present, otherwise guess a reasonable future date or leave empty string.
- apply_url: Any URL found, or empty.
- short_description: 150-200 characters summary.
- description: Full Markdown detailed description.
- requirements: Array of requirement strings.
- responsibilities: Array of responsibility strings.
- benefits: Array of benefit strings.

Output ONLY valid JSON.`
            };

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [systemMessage, { role: 'user', content: text }],
                    temperature: 0.2,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Error from AI service');

            return NextResponse.json(JSON.parse(data.choices[0].message.content));
        }

        else if (action === 'generate_cover_letter') {
            const { cvText, jobDetails } = body;
            const systemMessage = {
                role: 'system',
                content: `You are an expert career coach and professional copywriter helping African youth get jobs. Given a user's CV/Resume text and the target Job/Opportunity description, write a highly tailored, professional, and compelling cover letter. Keep it concise (3-4 paragraphs max). Do not include placeholder text like [Company Name] if it's provided in the input, but if it's missing, you can use placeholders. The tone should be confident but humble.`
            };

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        systemMessage, 
                        { role: 'user', content: `=== USER CV/RESUME ===\n${cvText}\n\n=== JOB DESCRIPTION ===\n${jobDetails}\n\nPlease generate my tailored cover letter.` }
                    ],
                    temperature: 0.7,
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Error from AI service');

            return NextResponse.json({ coverLetter: data.choices[0].message.content });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
    }
}
