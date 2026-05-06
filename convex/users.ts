import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreate = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: "customer",
      subscriptionPlan: "free",
    });
  },
});

export const getCurrent = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const updateRole = mutation({
  args: { userId: v.id("users"), role: v.union(v.literal("owner"), v.literal("customer")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscriptionPlan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;
    await ctx.db.patch(userId, data);
  },
});
