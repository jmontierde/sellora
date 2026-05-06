import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, storeName } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      const { generateText } = await import("ai");
      const { anthropic } = await import("@ai-sdk/anthropic");

      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: `You are a helpful shopping assistant for "${storeName}" online store.
Be friendly, concise, and helpful. Answer questions about products, shipping, returns, etc.
Keep responses short (1-3 sentences). If you don't know something specific, suggest the customer contact support.`,
        prompt: message,
      });

      return NextResponse.json({ reply: text });
    }

    // Fallback responses
    const lowerMessage = message.toLowerCase();
    let reply = "I'd be happy to help! Could you tell me more about what you're looking for?";

    if (lowerMessage.includes("ship")) {
      reply = "We offer free standard shipping on all orders. Delivery typically takes 3-5 business days.";
    } else if (lowerMessage.includes("return")) {
      reply = "We accept returns within 30 days of purchase. Items must be in original condition.";
    } else if (lowerMessage.includes("pay")) {
      reply = "We accept all major credit cards and offer secure checkout powered by Stripe.";
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      reply = `Welcome to ${storeName}! How can I help you today?`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
