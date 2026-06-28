import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Input validation constants
const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES_COUNT = 50;
const MAX_TEXT_LENGTH = 10000; // For extract/cv actions
const MAX_PROMPT_LENGTH = 2000;

function validateMessages(messages: unknown): { valid: boolean; error?: string } {
    if (!Array.isArray(messages)) {
        return { valid: false, error: 'Messages must be an array' };
    }
    if (messages.length > MAX_MESSAGES_COUNT) {
        return { valid: false, error: `Too many messages. Maximum is ${MAX_MESSAGES_COUNT}` };
    }
    for (const msg of messages) {
        if (!msg || typeof msg !== 'object') {
            return { valid: false, error: 'Each message must be an object' };
        }
        if (!['user', 'assistant', 'system'].includes((msg as Record<string, unknown>).role as string)) {
            return { valid: false, error: 'Invalid message role' };
        }
        const content = (msg as Record<string, unknown>).content;
        if (typeof content !== 'string') {
            return { valid: false, error: 'Message content must be a string' };
        }
        if (content.length > MAX_MESSAGE_LENGTH) {
            return { valid: false, error: `Message content exceeds maximum length of ${MAX_MESSAGE_LENGTH}` };
        }
    }
    return { valid: true };
}

export async function POST(req: Request) {
    // Rate limiting: 30 requests per minute per client for AI
    const rateLimitResult = checkRateLimit({
        maxRequests: 30,
        windowMs: 60_000,
        identifier: `ai:${getClientIdentifier(req)}`,
    });

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                    'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                    'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
                },
            }
        );
    }

    if (!GROQ_API_KEY) {
        return NextResponse.json({ error: 'AI is not configured.' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { action } = body;

        if (action === 'chat') {
            const { messages } = body;
            const validation = validateMessages(messages);
            if (!validation.valid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }

            // Strip 'id' field from messages (Groq doesn't support it)
            const cleanMsgs = messages.map((m: Record<string, unknown>) => ({ role: m.role, content: m.content }));

            // Only prepend default system message if client didn't provide one
            const hasSystemMsg = cleanMsgs.length > 0 && (cleanMsgs[0] as {role:string}).role === 'system';

            const defaultSystem = {
                role: 'system',
                content: `You are 'Job Openings Kenya AI Assistant', a helpful and friendly chatbot on the Job Openings Kenya website. Your purpose is to assist African youth in finding opportunities, answer questions about the platform, provide career advice, and give guidance on how to apply for opportunities. Do not mention that you are powered by Groq, OpenAI, or any other underlying technology.`
            };

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: hasSystemMsg ? cleanMsgs : [defaultSystem, ...cleanMsgs],
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
            if (typeof prompt !== 'string' || prompt.trim().length === 0) {
                return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
            }
            if (prompt.length > MAX_PROMPT_LENGTH) {
                return NextResponse.json({ error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH}` }, { status: 400 });
            }

            const systemMessage = {
                role: 'system',
                content: `You are an AI assistant for Job Openings Kenya content administrators. Your job is to generate high-quality blog posts based on a prompt. Output the result in valid JSON format ONLY with the following structure:
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
            if (typeof text !== 'string' || text.trim().length === 0) {
                return NextResponse.json({ error: 'Text is required' }, { status: 400 });
            }
            if (text.length > MAX_TEXT_LENGTH) {
                return NextResponse.json({ error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH}` }, { status: 400 });
            }

            const systemMessage = {
                role: 'system',
                content: `You are an AI assistant for Job Openings Kenya administrators. Extract EVERY possible field from the text. Return ONLY valid JSON with ALL these fields:
{
  "title": "Exact job/training title",
  "type": "Classify as EXACTLY one of: 'Job', 'Training', 'Grant', or 'Scholarship'. Use 'Training' for courses, internships, fellowships, or workshops; 'Grant' for funding/grants/awards to organisations or projects; 'Scholarship' for scholarships, bursaries, or study awards for students. Otherwise default to 'Job' for paid employment.",
  "company": "Hiring company/organization name (CRITICAL: extract from text, email domain, or URL. Do NOT use 'Unknown' unless impossible).",
  "location": "City or 'Remote' or 'Hybrid'",
  "deadline": "YYYY-MM-DD if mentioned, otherwise empty ''",
  "apply_url": "The application link, email address, or phone number found for applications. If it is an email like apply@company.com, keep it as apply@company.com. If website link, keep as website link.",
  "contact_email": "Primary contact email address found in the text.",
  "contact_phone": "Primary contact phone number found. Format as +254...",
  "short_description": "Engaging 1-sentence summary under 150 characters",
  "description": "A SHORT, to-the-point overview of the role and organisation: 2 to 4 sentences (roughly 50-90 words), a single tight paragraph. State what the role is and who it suits — no filler, no repetition, no padding. Do NOT list requirements, responsibilities, or benefits here (those go in their dedicated array fields). Clean markdown, no headings.",
  "requirements": ["Extract each qualification, skill, experience, or education requirement as a separate, plain-text string element in this array. Do NOT include markdown bullets (like '-', '*', '•'), numbering (like '1.', '2.'), or newlines within any element. Split multiple requirements into separate elements. Be extremely thorough. Extract at least 3-8 items if present."],
  "responsibilities": ["Extract each duty, task, or responsibility as a separate, plain-text string element in this array. Do NOT include markdown bullets (like '-', '*', '•'), numbering (like '1.', '2.'), or newlines within any element. Split multiple duties into separate elements. Be extremely thorough. Extract at least 3-8 items if present."],
  "benefits": ["Extract each perk, benefit, allowance, insurance, or working condition as a separate, plain-text string element in this array. Do NOT include markdown bullets, numbering, or newlines."],
  "salary_min": "number only, e.g. 50000. Empty if not mentioned.",
  "salary_max": "number only, e.g. 80000. Empty if not mentioned.",
  "salary_currency": "KES or USD etc. Default 'KES'."
}
If the text mentions a salary range like 'KES 50,000-80,000', extract both numbers. If only one number is given, put it in salary_min.
CRITICAL FORMATTING RULES:
1. 'description' MUST be a SHORT, clean overview of the company and role — 2 to 4 sentences (~50-90 words), concise and to the point with no padding. It MUST NOT contain the bulleted lists of requirements, qualifications, responsibilities, duties, or benefits/perks, as those MUST be extracted separately in their dedicated array fields. Strip them out from the description if they are present.
2. The arrays for 'requirements', 'responsibilities', and 'benefits' MUST contain clean, individual plain-text items. Do NOT start items with bullet characters (like '-', '*', '•'), checkboxes, or number prefixes (like '1. ', 'a. '). Do NOT combine multiple bullet points into a single array element; split them into separate strings.
3. Be extremely thorough and extract every detail. If a list of requirements or duties is long, extract all of them as separate items in the array.`
            };

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [systemMessage, { role: 'user', content: text }],
                    temperature: 0.2,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Error from AI service');

            let rawContent = data.choices[0].message.content.trim();
            if (rawContent.startsWith('```')) {
                rawContent = rawContent.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
            }
            return NextResponse.json(JSON.parse(rawContent));
        }

        else if (action === 'generate_cover_letter') {
            const { cvText, jobDetails } = body;
            if (typeof cvText !== 'string' || cvText.trim().length === 0) {
                return NextResponse.json({ error: 'CV text is required' }, { status: 400 });
            }
            if (typeof jobDetails !== 'string' || jobDetails.trim().length === 0) {
                return NextResponse.json({ error: 'Job details are required' }, { status: 400 });
            }
            if (cvText.length > MAX_TEXT_LENGTH || jobDetails.length > MAX_TEXT_LENGTH) {
                return NextResponse.json({ error: `Content exceeds maximum length of ${MAX_TEXT_LENGTH}` }, { status: 400 });
            }

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

        else if (action === 'generate_forum_post') {
            const { prompt } = body;
            if (typeof prompt !== 'string' || prompt.trim().length === 0) {
                return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
            }
            if (prompt.length > MAX_PROMPT_LENGTH) {
                return NextResponse.json({ error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH}` }, { status: 400 });
            }

            const systemMessage = {
                role: 'system',
                content: `You are a helpful writing assistant for a career community forum for African youth called Job Openings Kenya.
Your job is to help users write short, clear, and well-structured forum discussion posts.
Given a brief prompt from the user, write a focused forum post body — NOT a title.
Keep it concise: 3–5 sentences max. Sound natural, helpful, and conversational.
Do NOT add greetings like "Hello!" or sign-offs. Just the post content directly.`
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
                    max_tokens: 200,
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Error from AI service');

            return NextResponse.json({ content: data.choices[0].message.content });
        }

        else if (action === 'generate_profile') {
            const { prompt, type } = body;
            if (typeof prompt !== 'string' || prompt.trim().length === 0) {
                return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
            }
            if (prompt.length > MAX_PROMPT_LENGTH) {
                return NextResponse.json({ error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH}` }, { status: 400 });
            }
            if (type !== 'headline' && type !== 'bio') {
                return NextResponse.json({ error: 'Type must be "headline" or "bio"' }, { status: 400 });
            }

            const systemContent = type === 'headline'
                ? `You are an expert career coach helping African youth write a highly professional, catchy, and concise LinkedIn-style Headline based on their prompt. Keep it strictly under 80 characters. Do NOT wrap in quotes. Do NOT include greetings.`
                : `You are an expert career coach helping African youth write a professional, engaging, and clean profile Bio/About section. Use the user's prompt to generate a highly polished 3-4 sentence bio. Do NOT wrap in quotes. Do NOT include greetings. Sound natural and ambitious.`;

            const systemMessage = {
                role: 'system',
                content: systemContent
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
                    max_tokens: type === 'headline' ? 60 : 300,
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Error from AI service');

            return NextResponse.json({ content: data.choices[0].message.content });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });


    } catch (error: unknown) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to process request' }, { status: 500 });
    }
}
