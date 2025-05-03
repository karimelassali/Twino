import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Read the raw body to debug
    const rawBody = await req.text();
    console.log("Raw request body (Answerer):", rawBody);

    // Parse the body as JSON
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      console.error("Failed to parse request body as JSON (Answerer):", error.message);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { subject, personalityPair, previousMessage } = body;

    if (!subject || !personalityPair || !previousMessage) {
      return NextResponse.json({ error: "Missing subject, personalityPair, or previousMessage" }, { status: 400 });
    }

    const [_, bot2Name] = personalityPair.split(" × "); // Second bot (answerer)

    // Generate Bot 2's (answerer) response
    const bot2Prompt = `You are ${bot2Name}. Respond to the previous message from ${personalityPair.split(" × ")[0]} in a natural, conversational way about the topic "${subject}" always in clean arbic language. Keep your response concise (1-2 sentences).\nPrevious message: ${previousMessage.message}`;

    const bot2Result = await generateText({
      model: google('gemini-1.5-flash'), // Use 'gemini-pro' if 'gemini-1.5-flash' fails
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: bot2Prompt,
            },
          ],
        },
      ],
    });

    const bot2Response = bot2Result.text.trim();

    // Return the answerer's message
    const message = {
      sender: bot2Name,
      message: bot2Response,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Gemini API Error (Answerer):", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      status: error.status,
    });
    if (error.status === 429) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "Failed to generate answerer's response" }, { status: 500 });
  }
}