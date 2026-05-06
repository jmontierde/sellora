import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMessages = query({
  args: { storeId: v.id("stores"), sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_storeId_sessionId", (q) =>
        q.eq("storeId", args.storeId).eq("sessionId", args.sessionId)
      )
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    storeId: v.id("stores"),
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", args);
  },
});
