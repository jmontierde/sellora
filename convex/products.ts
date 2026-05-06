import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    images: v.array(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    inventory: v.number(),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check product limits based on plan
    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");

    const user = await ctx.db.get(store.userId);
    if (!user) throw new Error("User not found");

    const products = await ctx.db
      .query("products")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();

    const limits: Record<string, number> = { free: 10, pro: 100, enterprise: 10000 };
    if (products.length >= limits[user.subscriptionPlan]) {
      throw new Error(`Product limit reached. Upgrade your plan.`);
    }

    return await ctx.db.insert("products", args);
  },
});

export const getByStore = query({
  args: {
    storeId: v.id("stores"),
    category: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products;

    if (args.category) {
      products = await ctx.db
        .query("products")
        .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
        .collect();
      products = products.filter((p) => p.category === args.category);
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
        .collect();
    }

    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return products;
  },
});

export const getPublished = query({
  args: {
    storeId: v.id("stores"),
    category: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();

    products = products.filter((p) => p.isPublished);

    if (args.category) {
      products = products.filter((p) => p.category === args.category);
    }

    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return products;
  },
});

export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

export const update = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    inventory: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { productId, ...data } = args;
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(productId, updateData);
  },
});

export const remove = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.productId);
  },
});

export const getCategories = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();
    return [...new Set(products.map((p) => p.category))];
  },
});
