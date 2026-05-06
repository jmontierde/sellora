import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, products } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      const { generateText } = await import("ai");
      const { anthropic } = await import("@ai-sdk/anthropic");

      const productList = products
        .map((p: { name: string; description: string; category: string; tags: string[] }, i: number) =>
          `${i}: ${p.name} - ${p.description} [${p.category}] (${p.tags.join(", ")})`
        )
        .join("\n");

      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        prompt: `A customer searched for: "${query}"

Here are the available products:
${productList}

Return a JSON array of the indices (numbers) of the most relevant products, ordered by relevance. Return at most 10 results.
Only return the JSON array, nothing else.`,
      });

      try {
        const indices = JSON.parse(text);
        const results = indices.map((i: number) => products[i]).filter(Boolean);
        return NextResponse.json({ results });
      } catch {
        return NextResponse.json({ results: products });
      }
    }

    // Fallback: basic keyword matching
    const lowerQuery = query.toLowerCase();
    const results = products.filter(
      (p: { name: string; description: string; tags: string[] }) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags.some((t: string) => t.toLowerCase().includes(lowerQuery))
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
