import { NextResponse } from 'next/server';

/**
 * Responder API: Reads the last message and replies with professional depth and character consistency using Pollinations.ai.
 */
export async function POST(req) {
  try {
    const { subject, personalityPair, previousMessage } = await req.json();
    if (!subject || !personalityPair || !previousMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [bot1Name, bot2Name] = personalityPair.split(' × ').map(name => name.trim());
    
    // Detect language from the previous message (simple detection based on Arabic characters)
    const isArabic = /[\u0600-\u06FF]/.test(previousMessage.message);
    const language = isArabic ? 'Arabic' : 'English';
    
    const personaDescription = `You are **${bot2Name}**, a thoughtful and knowledgeable conversationalist. Your role is to respond to **${bot1Name}** with clarity, insight, and adherence to your character.`;

    // The prompt was inverted in the original request. Corrected to match the language detection.
    const bot2Prompt = !isArabic 
      ? `---Context---\nTopic: "${subject}"\nPrevious Message: ${previousMessage.sender} said: "${previousMessage.message}"\n---Task---\nYou are **${bot2Name}**, respond in ${language} clearly and professionally.\n1. If there's a question, start with a direct answer in a short sentence.\n2. Then, provide deeper analysis or supporting examples to clarify your perspective.\n3. Conclude with one thought-provoking question or addition that moves the discussion forward.`
      : `---سياق---\nالموضوع: "${subject}"\nالرسالة السابقة: ${previousMessage.sender} قال: "${previousMessage.message}"\n---المهمة---\nأنت **${bot2Name}**، أجب باللغة العربية الفصحى بوضوح ومهنية.\n1. إذا كان هناك سؤال، ابدأ بالإجابة المباشرة ضمن جملة قصيرة.\n2. بعد ذلك، قدم تحليل أعمق أو أمثلة داعمة لتوضيح وجهة نظرك.\n3. اختم بسؤال واحد تحفيزي أو إضافة تدفع النقاش لمرحلة جديدة.`;

    // --- MODIFICATION START ---
    // Replaced Google AI SDK with a fetch call to Pollinations.ai
    const encodedPrompt = encodeURIComponent(bot2Prompt);
    const pollinationUrl = `https://text.pollinations.ai/${encodedPrompt}`;
    
    const response = await fetch(pollinationUrl);

    if (!response.ok) {
        throw new Error(`Pollinations API request failed with status ${response.status}`);
    }

    const bot2Response = (await response.text()).trim();
    // --- MODIFICATION END ---

    return NextResponse.json({
      message: { sender: bot2Name, message: bot2Response, timestamp: new Date().toISOString() }
    });

  } catch (error) {
    console.error('Responder API Error:', error);
    const status = error.status === 429 ? 429 : 500;
    const msg = error.status === 429 ? 'Rate limit exceeded' : 'Failed to generate responder response';
    return NextResponse.json({ error: status === 500 ? error.message : msg }, { status });
  }
}
