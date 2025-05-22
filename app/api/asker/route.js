import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

/**
 * Asker API: Generates a dynamic, context-aware question or opening remark based on the chosen personality.
 */
export async function POST(req) {
  try {
    const { subject, personalityPair, previousMessages = [] } = await req.json();
    if (!subject || !personalityPair) {
      return NextResponse.json({ error: 'Missing subject or personalityPair' }, { status: 400 });
    }

    // Extract the two personas
    const [bot1Name, bot2Name] = personalityPair.split(' × ').map(name => name.trim());

    // Build a dynamic persona description
    const personaDescription = `You are **${bot1Name}**, an expert with a unique perspective in discussion. Your counterpart is **${bot2Name}**. You always stay in character, speak clearly, and adapt your tone based on the topic.`;

    // Create a professional, dynamic prompt
    const bot1Prompt = previousMessages.length > 0
      ? `---سياق---\nالموضوع: "${subject}"\nسجل الحوار: ${previousMessages.map((m, i) => `(${i+1}) ${m.sender}: "${m.message}"`).join(' | ')}\n---المهمة---\nأنت **${bot1Name}**، تحدث بالعربية الفصحى بوضوح وباختصار.\n1. إذا كان السؤال واضحاً، ابدأ بالإجابة عليه مباشرةً وجواب قصير ومباشر.\n2. بعد ذلك، أضف توضيحات أو أمثلة لتوسيع النقاش.\n3. أختم بسؤال تحفيزي واحد لدفع الحوار للأمام.`
      : `---سياق---\nالموضوع: "${subject}"\n---المهمة---\nأنت **${bot1Name}**، تحدث بالعربية الفصحى بجرأة ومهنية.\n1. ابدأ بسؤال مباشر وغير تقليدي يفتح زاوية جديدة على الموضوع.\n2. إذا أمكن، ضمن سطرين تعليقا موجزا يوضح هدف السؤال.`;

    const bot1Result = await generateText({
      model: google('gemini-1.5-flash-8b'),
      messages: [{ role: 'user', content: [{ type: 'text', text: bot1Prompt }] }],
    });

    const bot1Response = bot1Result.text.trim();

    return NextResponse.json({
      message: { sender: bot1Name, message: bot1Response, timestamp: new Date().toISOString() }
    });

  } catch (error) {
    console.error('Asker API Error:', error);
    const status = error.status === 429 ? 429 : 500;
    const msg = error.status === 429 ? 'Rate limit exceeded' : 'Failed to generate asker response';
    return NextResponse.json({ error: msg }, { status });
  }
}