import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingSlug = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existingSlug) throw new Error("Store slug already taken");

    // Check plan limits
    const userStores = await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const limits: Record<string, number> = { free: 1, pro: 5, enterprise: 50 };
    if (userStores.length >= limits[user.subscriptionPlan]) {
      throw new Error(`Upgrade your plan to create more stores`);
    }

    // Promote user to owner role
    if (user.role === "customer") {
      await ctx.db.patch(args.userId, { role: "owner" });
    }

    return await ctx.db.insert("stores", {
      userId: args.userId,
      name: args.name,
      slug: args.slug,
      description: args.description,
      theme: { primaryColor: "#6366f1", accentColor: "#8b5cf6" },
      isActive: true,
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getById = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.storeId);
  },
});

export const update = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    theme: v.optional(
      v.object({ primaryColor: v.string(), accentColor: v.string() })
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { storeId, ...data } = args;
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(storeId, updateData);
  },
});

export const remove = mutation({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.storeId);
  },
});
