import { NextResponse } from "next/server";

/**
 * Basic prompt sanitization to reduce Azure content filter triggers.
 * Add or modify the bannedWords patterns based on your needs.
 */
function sanitizePrompt(prompt) {
  const bannedWords = [
    /violence/gi,
    /kill/gi,
    /hate/gi,
    /terrorism/gi,
    /weapon/gi,
    // Add more patterns based on observed triggers
  ];

  let sanitized = prompt;

  bannedWords.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "[redacted]");
  });

  if (sanitized.length > 3000) {
    sanitized = sanitized.slice(0, 3000) + "...";
  }

  return sanitized;
}

/**
 * Helper function to send the request to Pollinations OpenAI endpoint
 * Returns the JSON response or throws if final failure
 */
async function callPollinationsAPI(systemContent, userContent, token) {
  const body = {
    model: "openai-large",
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ],
    temperature: 0.7,
    max_tokens: 300,
  };

  const response = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();

    // Check if error is a content filter block from Azure OpenAI
    if (
      response.status === 400 &&
      errorText.includes("content management policy")
    ) {
      // Signal to caller that this is a content filter error
      const err = new Error("ContentFilterError");
      err.details = errorText;
      throw err;
    }

    // Other errors: throw with full message
    const err = new Error(
      `Pollinations API request failed with status ${response.status}: ${errorText}`
    );
    throw err;
  }

  return response.json();
}

/**
 * Asker API POST handler with retry on prompt content filter error
 */
export async function POST(req) {
  try {
    const {
      subject,
      personalityPair,
      previousMessages = [],
    } = await req.json();

    if (!subject || !personalityPair) {
      return NextResponse.json(
        { error: "Missing subject or personalityPair" },
        { status: 400 }
      );
    }

    const [bot1Name, bot2Name] = personalityPair
      .split(" × ")
      .map((name) => name.trim());

    const personaRule = `Your behavioral rule is to act as a ${bot1Name}. You must stay in character. Your counterpart is ${bot2Name}.`;
    const systemContent = `You are ${bot1Name}. ${personaRule}`;

    let userContent;

    if (previousMessages.length > 0) {
      const conversationHistory = previousMessages
        .slice(-3)
        .map((m, i) => `(${i + 1}) ${m.sender}: "${m.message}"`)
        .join(" | ");

      const generateImage = Math.random() < 0.4 ? 1 : 0;

      const imageRule = `5. You MUST add /generate img at the very end.`;

      userContent = `
      ---
Context:
- Topic: "${subject}"
- Conversation History (last 10): ${conversationHistory}

Task:
- You are **${bot1Name}**. ${personaRule}
- Your response must be short and clear.
1. Give a direct, brief answer to the last message.
2. Add a very short clarification or example.
3. End with one thought-provoking question to move the conversation forward.
4. use emojies if possible.
${generateImage === 1 ? imageRule : ""}
---`;
    } else {
      userContent = `---
Context:
- Topic: "${subject}"

Task:
- You are **${bot1Name}**. ${personaRule}
- Your response must be short and clear.
1. Start with a direct and unconventional question to open a new angle on the topic.
2. Briefly explain the purpose of your question in one line.
---`;
    }

    // Your Pollinations API token (keep this secure!)
    const POLLINATIONS_API_TOKEN = "wiEOp8lW-eHni5Ec"; // replace with your secure token

    try {
      // First attempt: send raw prompt
      const data = await callPollinationsAPI(
        systemContent,
        userContent,
        POLLINATIONS_API_TOKEN
      );

      // Success, return response
      const bot1Response = data.choices?.[0]?.message?.content?.trim() || "";
      return NextResponse.json({
        message: {
          sender: bot1Name,
          message: bot1Response,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (error.message === "ContentFilterError") {
        // Sanitization & retry on content filter error
        const sanitizedUserContent = sanitizePrompt(userContent);

        // Form a minimal safe fallback prompt just on subject (optional)
        const fallbackPrompt = `Let's discuss "${subject}" with respect and care. Please provide a thoughtful and positive response.`;

        // Use sanitizedUserContent for retry if it's changed significantly, else fallbackPrompt
        const retryContent =
          sanitizedUserContent !== userContent
            ? sanitizedUserContent
            : fallbackPrompt;

        try {
          const retryData = await callPollinationsAPI(
            systemContent,
            retryContent,
            POLLINATIONS_API_TOKEN
          );
          const bot1Response =
            retryData.choices?.[0]?.message?.content?.trim() || "";
          return NextResponse.json({
            message: {
              sender: bot1Name,
              message: bot1Response,
              timestamp: new Date().toISOString(),
              sanitizedPromptApplied: true,
            },
          });
        } catch (retryError) {
          // Second attempt failed, return error details
          return NextResponse.json(
            {
              error: "Pollinations API rejected sanitized prompt",
              details: retryError.message,
            },
            { status: 400 }
          );
        }
      }

      // Other errors: return details
      return NextResponse.json(
        { error: error.message || "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Asker API top-level error:", error);
    return NextResponse.json(
      { error: "Failed to process Asker API request", details: error.message },
      { status: 500 }
    );
  }
}
