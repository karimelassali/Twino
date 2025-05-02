import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { subject, personalityPair, previousMessages = [] } = await req.json();
    console.log(subject, personalityPair, previousMessages);
    if (!subject || !personalityPair) {
      return NextResponse.json({ error: "Missing subject or personalityPair" }, { status: 400 });
    }

    const bot1Name = personalityPair; // Only need the first bot (asker)

    // Generate Bot 1's (asker) response
    const bot1Prompt = previousMessages.length > 0
      ? `You are ${bot1Name}. Respond to the previous message in a natural, conversational way about the topic "${subject}". Keep your response concise (1-2 sentences).\nPrevious message: ${previousMessages[previousMessages.length - 1].message}`
      : `You are ${bot1Name}. Ask a question about the topic "${subject}". Keep your response concise (1-2 sentences).`;

    const bot1Result = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: bot1Prompt,
            },
          ],
        },
      ],
    });

    const bot1Response = bot1Result.text.trim();

    // Return the asker's message
    const message = {
      sender: bot1Name,
      message: bot1Response,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Gemini API Error (Asker):", error);
    if (error.status === 429) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "Failed to generate asker's response" }, { status: 500 });
  }
}