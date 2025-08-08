import { NextResponse } from 'next/server';

/**
 * Asker API: Generates a dynamic, context-aware question or opening remark 
 * using Pollinations.ai based on the chosen personality.
 */
export async function POST(req) {
  try {
    const { subject, personalityPair, previousMessages = [] } = await req.json();

    if (!subject || !personalityPair) {
      return NextResponse.json({ error: 'Missing subject or personalityPair' }, { status: 400 });
    }

    // Extract the two personas
    const [bot1Name, bot2Name] = personalityPair.split(' × ').map(name => name.trim());

    // Detect language from the subject or previous messages
    const detectLanguage = (text) => /[\u0600-\u06FF]/.test(text) ? 'Arabic' : 'English';
    const language = previousMessages.length > 0 ? detectLanguage(previousMessages[previousMessages.length - 1].message) : detectLanguage(subject);
    const isEnglish = language === 'English';

    // Build a dynamic persona description
    const personaDescription = `You are **${bot1Name}**, an expert with a unique perspective in discussion. Your counterpart is **${bot2Name}**. You always stay in character, speak clearly, and adapt your tone based on the topic.`;

    // Create a professional, dynamic prompt
    let bot1Prompt;

    if (previousMessages.length > 0) {
      bot1Prompt = isEnglish
        ? `---Context---\nTopic: "${subject}"\nConversation History: ${previousMessages.map((m, i) => `(${i+1}) ${m.sender}: "${m.message}"`).join(' | ')}\n---Task---\nYou are **${bot1Name}**, respond in ${language} clearly and concisely.\n1. If the question is clear, start with a direct and brief answer.\n2. Then, add clarifications or examples to expand the discussion.\n3. End with one thought-provoking question to move the conversation forward.`
        : `---سياق---\nالموضوع: "${subject}"\nسجل الحوار: ${previousMessages.map((m, i) => `(${i+1}) ${m.sender}: "${m.message}"`).join(' | ')}\n---المهمة---\nأنت **${bot1Name}**، تحدث بالعربية الفصحى بوضوح وباختصار.\n1. إذا كان السؤال واضحاً، ابدأ بالإجابة عليه مباشرةً وجواب قصير ومباشر.\n2. بعد ذلك، أضف توضيحات أو أمثلة لتوسيع النقاش.\n3. أختم بسؤال تحفيزي واحد لدفع الحوار للأمام.`;
    } else {
      bot1Prompt = isEnglish
        ? `---Context---\nTopic: "${subject}"\n---Task---\nYou are **${bot1Name}**, speak in ${language} with confidence and professionalism.\n1. Start with a direct and unconventional question that opens a new angle on the topic.\n2. If possible, include a brief one or two-line comment explaining the purpose of the question.`
        : `---سياق---\nالموضوع: "${subject}"\n---المهمة---\nأنت **${bot1Name}**، تحدث بالعربية الفصحى بجرأة ومهنية.\n1. ابدأ بسؤال مباشر وغير تقليدي يفتح زاوية جديدة على الموضوع.\n2. إذا أمكن، ضمن سطرين تعليقاً موجزاً يوضح هدف السؤال.`;
    }

    // --- MODIFICATION START ---
    // Replaced Google AI SDK with a fetch call to Pollinations.ai
    const encodedPrompt = encodeURIComponent(bot1Prompt);
    const pollinationUrl = `https://text.pollinations.ai/${encodedPrompt}`;
    
    const response = await fetch(pollinationUrl);

    if (!response.ok) {
        throw new Error(`Pollinations API request failed with status ${response.status}`);
    }

    const bot1Response = (await response.text()).trim();
    // --- MODIFICATION END ---

    return NextResponse.json({
      message: {
        sender: bot1Name,
        message: bot1Response,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Asker API Error:', error);
    // Basic error handling, can be customized further.
    const status = error.status === 429 ? 429 : 500;
    const msg = error.status === 429 ? 'Rate limit exceeded' : 'Failed to generate asker response';
    return NextResponse.json({ error: status === 500 ? error.message : msg }, { status });
  }
}
