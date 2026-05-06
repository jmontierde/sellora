import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("owner"), v.literal("customer")),
    subscriptionPlan: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  stores: defineTable({
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    theme: v.object({
      primaryColor: v.string(),
      accentColor: v.string(),
    }),
    isActive: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_slug", ["slug"]),

  products: defineTable({
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
  })
    .index("by_storeId", ["storeId"])
    .index("by_category", ["category"]),

  orders: defineTable({
    storeId: v.id("stores"),
    customerId: v.optional(v.id("users")),
    customerEmail: v.string(),
    customerName: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    total: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    shippingAddress: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
    stripePaymentIntentId: v.optional(v.string()),
  })
    .index("by_storeId", ["storeId"])
    .index("by_customerId", ["customerId"])
    .index("by_status", ["status"]),

  cartItems: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
    storeId: v.id("stores"),
    productId: v.id("products"),
    quantity: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_userId", ["userId"]),

  chatMessages: defineTable({
    storeId: v.id("stores"),
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  }).index("by_storeId_sessionId", ["storeId", "sessionId"]),
});
