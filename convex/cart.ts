import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addItem = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
    storeId: v.id("stores"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const existingItem = existing.find(
      (item) => item.productId === args.productId
    );

    if (existingItem) {
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
      });
      return existingItem._id;
    }

    return await ctx.db.insert("cartItems", args);
  },
});

export const getItems = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Enrich with product data
    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return {
          ...item,
          product,
        };
      })
    );

    return enriched.filter((item) => item.product !== null);
  },
});

export const updateQuantity = mutation({
  args: {
    itemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      await ctx.db.delete(args.itemId);
      return;
    }
    await ctx.db.patch(args.itemId, { quantity: args.quantity });
  },
});

export const removeItem = mutation({
  args: { itemId: v.id("cartItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.itemId);
  },
});

export const clearCart = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});
