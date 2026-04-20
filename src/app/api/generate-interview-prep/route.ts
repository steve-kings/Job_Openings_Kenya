import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { jobTitle, jobDescription, company } = await req.json();

        if (!jobTitle || !jobDescription) {
            return NextResponse.json(
                { error: 'Job details are required' },
                { status: 400 }
            );
        }

        const prompt = `
            You are an expert career coach and hiring manager.
            Your client is preparing for an interview for the following role:
            Role: ${jobTitle}
            Company: ${company || 'Unknown'}
            Job Description: ${jobDescription}

            Please generate exactly the top 5 most likely interview questions they will be asked based specifically on this job description.
            For each question, provide a confident, highly professional "Cheat Sheet" sample answer that highlights the skills requested in the job description.
            
            Format your output cleanly in Markdown. Do not include any intro or outro text, strictly output the questions and answers. Use the following structured format:
            **1. [Question Text]**
            *Suggested Answer:* [Your answer...]

            Make the answers powerful, concise, and action-oriented.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an elite career coach generating highly accurate interview questions and pristine example answers.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama3-8b-8192',
            temperature: 0.7,
            max_tokens: 1500,
        });

        const prepMaterial = completion.choices[0]?.message?.content || 'Unable to generate interview prep. Please try again.';

        return NextResponse.json({ prepMaterial });
    } catch (error) {
        console.error('Error in Groq API Integration:', error);
        return NextResponse.json(
            { error: 'Failed to generate interview preparation material.' },
            { status: 500 }
        );
    }
}
