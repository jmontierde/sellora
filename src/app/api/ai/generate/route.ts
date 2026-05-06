import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productName, category, tags } = await req.json();

    // Use AI SDK with Anthropic for generating product descriptions
    // Falls back to a template-based approach if no API key is set
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      const { generateText } = await import("ai");
      const { anthropic } = await import("@ai-sdk/anthropic");

      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        prompt: `Write a compelling, professional product description for an e-commerce listing. Keep it concise (2-3 sentences).

Product: ${productName}
Category: ${category || "General"}
Tags: ${tags || "None"}

Write only the description, no titles or bullet points.`,
      });

      return NextResponse.json({ description: text });
    }

    // Fallback template
    const description = `Introducing the ${productName} — crafted with premium quality and attention to detail. ${
      category ? `Perfect for ${category.toLowerCase()} enthusiasts, ` : ""
    }this product delivers exceptional value and performance. ${
      tags ? `Featuring ${tags.split(",")[0]?.trim()} technology for an unmatched experience.` : "Designed to exceed your expectations."
    }`;

    return NextResponse.json({ description });
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
