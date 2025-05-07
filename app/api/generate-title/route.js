import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        // Parse request body
        let body;
        try {
            const rawBody = await req.text();
            body = JSON.parse(rawBody);
        } catch (error) {
            return NextResponse.json({ title: "Untitled Conversation", error: "Invalid JSON in request body" }, { status: 200 });
        }

        const { subject, personalityPair } = body;
        
        // Check for required parameters
        if (!subject || !personalityPair) {
            return NextResponse.json({ 
                title: `${subject || "Topic"} Discussion`, 
                error: "Missing subject or personalityPair" 
            }, { status: 200 });
        }

        const prompt = `Generate a concise, engaging title for a conversation about "${subject}" between ${personalityPair}. Return ONLY the title text without any additional explanation, quotation marks, or formatting. The title should be 3-7 words maximum.`;
        
        const result = await generateText({
            model: google('gemini-1.5-flash'),
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt,
                        },
                    ],
                },
            ],
        });

        const title = result.text.trim();

        return NextResponse.json({ title });
    } catch (error) {
        console.error("Error generating title:", error);
        return NextResponse.json({ title: "Fascinating Conversation", error: "Failed to generate title" }, { status: 200 });
    }
}