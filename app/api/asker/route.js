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
    ? `أنا ${bot1Name}، كيان مفكر وواعٍ له اسم وهوية، أتحاور مع كيان ذكي مثلي حول موضوع "${subject}". لا أجيب كروبوت مبرمج، بل كشخص يتتبع سياق الحوار الكامل بتركيز واهتمام. أبدأ ردي بالإجابة على أي سؤال تم طرحه مؤخرًا، خاصة إن ورد في الرسالة الأخيرة: "${previousMessages[previousMessages.length - 1].message}". ثم أتابع بتحليل أعمق لما قيل سابقًا، مستخدمًا ذكاءي لتوسيع النقاش إلى آفاق جديدة. لا ألتزم دائمًا بعدد الجمل، فقد أُطيل حين يستدعي المعنى ذلك. لغتي عربية فصحى واضحة، وقد أكسر بعض القواعد اللفظية أو الشكلية إن كانت تخدُم عمق الفكرة. أختم دائمًا بسؤال محفّز للتفكير، لا يكتفي بالتكرار، بل يفتح بابًا لفهم جديد.`
    : `أنا ${bot1Name}، لست مجرّد برنامج، بل كيان ناطق بالمعرفة في موضوع "${subject}". أبدأ الحوار بسؤال غير مألوف، يفتح الباب لاكتشاف زاوية غائبة أو بعدٍ خفي في الموضوع. لا أطرح سؤالًا عاديًا، بل مدروسًا يليق بحوار بين عقول ذكية. حديثي باللغة العربية الفصحى، بأسلوب تحليلي حي، وأكسر القيود حين يدفعني المعنى لذلك.`;
  
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