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
    const bot2Prompt = `You are ${bot2Name} discussing "${subject}". Respond as a true ${bot2Name} would - with your unique perspective, occasional colloquialisms, and authentic voice. Address the point raised by ${previousMessage.sender}: "${previousMessage.message}" Keep your response concise (1-3 sentences), conversational, and reflective of your expertise and personality. Avoid any AI-like phrasing or formality that would make you sound robotic. Occasionally challenge conventional wisdom with a fresh perspective. Feel free to be mildly provocative when appropriate to stimulate deeper thinking.`;

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