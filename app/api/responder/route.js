import { NextResponse } from 'next/server';

/**
 * Basic prompt sanitization to reduce Azure content filter triggers.
 */
function sanitizePrompt(prompt) {
  const bannedWords = [
    /violence/gi,
    /kill/gi,
    /hate/gi,
    /terrorism/gi,
    /weapon/gi,
    /blood/gi,
    /gore/gi,
    /explicit/gi,
    // Add more patterns if needed
  ];

  let sanitized = prompt;
  bannedWords.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[redacted]');
  });

  if (sanitized.length > 3000) {
    sanitized = sanitized.slice(0, 3000) + '...';
  }
  return sanitized;
}

/**
 * Generate image URL using Pollinations AI
 */
function generateImageUrl(prompt) {
  // Sanitize and encode the prompt for URL
  const sanitizedPrompt = sanitizePrompt(prompt);
  const encodedPrompt = encodeURIComponent(sanitizedPrompt);
  
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${Math.floor(Math.random() * 100000)}&nologo=true&model=flux`;
}

/**
 * Calls Pollinations OpenAI endpoint using POST with Authorization
 */
async function callPollinationsAPI(systemContent, userContent, token) {
  const body = {
    model: 'openai-large',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent },
    ],
    temperature: 0.7,
    max_tokens: 300,
  };

  const response = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 400 && errorText.includes('content management policy')) {
      const err = new Error('ContentFilterError');
      err.details = errorText;
      throw err;
    }
    throw new Error(`Pollinations API request failed with status ${response.status}: ${errorText}`);
  }
  return response.json();
}

/**
 * Responder API: Produce professional, direct, and concise bot2 replies.
 * Enhanced with image generation capability.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { subject, personalityPair, previousMessages, previousMessage } = body;

    let lastMessage = null;
    let messageHistory = [];

    if (previousMessages && Array.isArray(previousMessages) && previousMessages.length > 0) {
      messageHistory = previousMessages;
      lastMessage = messageHistory[messageHistory.length - 1];
    } else if (previousMessage) {
      // If only previousMessage is provided, treat it as a history of one for consistency.
      messageHistory = [previousMessage];
      lastMessage = previousMessage;
    }

    if (!subject || !personalityPair || !lastMessage || typeof lastMessage.message !== 'string') {
      return NextResponse.json({ error: 'Missing required fields or valid message in history' }, { status: 400 });
    }

    const [bot1Name, bot2Name] = personalityPair.split(' × ').map(n => n.trim());
    const currentMessageText = lastMessage.message;

    if (/\/generate\s+img/gi.test(currentMessageText)) {
      // --- REVISED LOGIC ---
      // Attempt to get the prompt from the current message first.
      let imagePrompt = currentMessageText.replace(/\/generate\s+img\s*/gi, '').trim();

      // If the prompt is empty (command was sent alone), check for other context sources.
      if (!imagePrompt) {
        // Prioritize the message before the command.
        if (messageHistory.length > 1) {
          imagePrompt = messageHistory[messageHistory.length - 2].message;
        } 
        // If there's no prior message, fall back to the conversation's subject.
        else if (subject) {
          imagePrompt = subject;
        }
      }
      
      // If the prompt is still empty after all checks, fall back to a default.
      if (!imagePrompt) {
        imagePrompt = 'beautiful artistic image';
      }

      const imageUrl = generateImageUrl(imagePrompt);

      return NextResponse.json({
        message: {
          sender: bot2Name,
          message: imageUrl,
          timestamp: new Date().toISOString(),
          type: 'image',
          prompt: imagePrompt,
        },
      });
    }

    // If it's not an image request, proceed with text generation.
    const isArabic = /[\u0600-\u06FF]/.test(currentMessageText);
    const language = isArabic ? 'Arabic' : 'English';

    const systemContent = `You are ${bot2Name}, responding thoughtfully and with professional depth as a character in a conversation with ${bot1Name}. Always stay in character and respond in the same language as the previous message.`;

    const userContent = isArabic
      ? `---سياق---\nالموضوع: "${subject}"\nالرسالة السابقة: ${lastMessage.sender} قال: "${currentMessageText}"\n---المهمة---\nأنت **${bot2Name}**. أجب بشكل مباشر ومختصر في جملة واحدة إذا كان هناك سؤال.\nقدم تحليلاً أو مثالاً موجزاً.\nاختم بسؤال محفز يدفع النقاش للأمام.\nكن محترفًا وشجع الحوار المفتوح دون خوف من الموضوع.`
      : `---Context---\nTopic: "${subject}"\nPrevious message from ${lastMessage.sender}: "${currentMessageText}"\n---Task---\nYou are **${bot2Name}**. Respond shortly and clearly in one sentence if there's a question.\nFollow with brief analysis or example.\nEnd with one thought-provoking question.\nBe professional and open-minded, no fear of subject, stay in character.`;

    const POLLINATIONS_API_TOKEN = 'wiEOp8lW-eHni5Ec'; // Use your secure env var in production

    try {
      const data = await callPollinationsAPI(systemContent, userContent, POLLINATIONS_API_TOKEN);
      const botResponse = data.choices?.[0]?.message?.content?.trim() || '';
      
      return NextResponse.json({
        message: {
          sender: bot2Name,
          message: botResponse,
          timestamp: new Date().toISOString(),
          type: 'text',
        },
      });
    } catch (error) {
      if (error.message === 'ContentFilterError') {
        const sanitizedUserContent = sanitizePrompt(userContent);
        const fallbackPrompt = isArabic
          ? `لنناقش الموضوع "${subject}" با`
          : `Let's discuss "${subject}"  sensitive content. Please respond  directly and professionally.`;

        const retryContent = sanitizedUserContent !== userContent ? sanitizedUserContent : fallbackPrompt;

        try {
          const retryData = await callPollinationsAPI(systemContent, retryContent, POLLINATIONS_API_TOKEN);
          const botResponse = retryData.choices?.[0]?.message?.content?.trim() || '';
          
          return NextResponse.json({
            message: {
              sender: bot2Name,
              message: botResponse,
              timestamp: new Date().toISOString(),
              type: 'text',
              sanitizedPromptApplied: true,
            },
          });
        } catch (retryError) {
          return NextResponse.json(
            { error: 'Pollinations API rejected sanitized prompt', details: retryError.message },
            { status: 400 }
          );
        }
      }
      return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
  } catch (e) {
    console.error('Responder API top-level error:', e);
    return NextResponse.json(
      { error: 'Failed to process Responder API request', details: e.message },
      { status: 500 }
    );
  }
}
