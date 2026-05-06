import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productName, category, allProducts } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      const { generateText } = await import("ai");
      const { anthropic } = await import("@ai-sdk/anthropic");

      const productList = allProducts
        .map((p: { name: string; category: string }) => `- ${p.name} (${p.category})`)
        .join("\n");

      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        prompt: `Given this product: "${productName}" in category "${category}",
and this list of other products:
${productList}

Return the names of the 4 most relevant/complementary products as a JSON array of strings.
Only return the JSON array, nothing else.`,
      });

      try {
        const recommendations = JSON.parse(text);
        return NextResponse.json({ recommendations });
      } catch {
        return NextResponse.json({ recommendations: [] });
      }
    }

    // Fallback: recommend products from the same category
    const sameCategoryProducts = allProducts
      .filter((p: { name: string; category: string }) => p.category === category && p.name !== productName)
      .slice(0, 4)
      .map((p: { name: string }) => p.name);

    return NextResponse.json({ recommendations: sameCategoryProducts });
  } catch (error) {
    console.error("AI recommend error:", error);
    return NextResponse.json({ recommendations: [] }, { status: 500 });
  }
}
