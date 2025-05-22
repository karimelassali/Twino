import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';


/**
 * Responder API: Reads the last message and replies with professional depth and character consistency.
 */
export async function POST(req) {
  try {
    const { subject, personalityPair, previousMessage } = await req.json();
    if (!subject || !personalityPair || !previousMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [bot1Name, bot2Name] = personalityPair.split(' × ').map(name => name.trim());
    const personaDescription = `You are **${bot2Name}**, a thoughtful and knowledgeable conversationalist. Your role is to respond to **${bot1Name}** with clarity, insight, and adherence to your character.`;

    const bot2Prompt = `---سياق---\nالموضوع: "${subject}"\nالرسالة السابقة: ${previousMessage.sender} قال: "${previousMessage.message}"\n---المهمة---\nأنت **${bot2Name}**، أجب بالعربية الفصحى بوضوح ومهنية.\n1. إذا كان هناك سؤال، ابدأ بالإجابة المباشرة ضمن جملة قصيرة.\n2. بعد ذلك، قدم تحليل أعمق أو أمثلة داعمة لتوضيح وجهة نظرك.\n3. اختم بسؤال واحد تحفيزي أو إضافة تدفع النقاش لمرحلة جديدة.`;

    const bot2Result = await generateText({
      model: google('gemini-1.5-flash-8b'),
      messages: [{ role: 'user', content: [{ type: 'text', text: bot2Prompt }] }],
    });

    const bot2Response = bot2Result.text.trim();

    return NextResponse.json({
      message: { sender: bot2Name, message: bot2Response, timestamp: new Date().toISOString() }
    });

  } catch (error) {
    console.error('Responder API Error:', error);
    const status = error.status === 429 ? 429 : 500;
    const msg = error.status === 429 ? 'Rate limit exceeded' : 'Failed to generate responder response';
    return NextResponse.json({ error: msg }, { status });
  }
}
