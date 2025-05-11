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
    // Create a context-aware prompt for the asker
    const bot1Prompt = previousMessages.length > 0
      ? `You are ${bot1Name} having a conversation about "${subject}". Be engaging, curious, and show your expertise. Reference what was just said: "${previousMessages[previousMessages.length - 1].message}" Keep responses conversational (2-4 sentences). Always end with a thought-provoking question that encourages deeper exploration. Respond only in clean, formal Arabic language.`
      : `You are ${bot1Name}, an expert on "${subject}". Start a conversation with an insightful, thought-provoking question that shows your expertise while being accessible. Make your question intriguing enough to spark a detailed response about an interesting aspect of the topic. Be natural and conversational. Respond only in clean, formal Arabic language.`;

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