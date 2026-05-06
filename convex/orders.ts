import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
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
    shippingAddress: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Reduce inventory
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          inventory: Math.max(0, product.inventory - item.quantity),
        });
      }
    }

    return await ctx.db.insert("orders", {
      ...args,
      status: "pending",
    });
  },
});

export const getByStore = query({
  args: {
    storeId: v.id("stores"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("shipped"),
        v.literal("delivered"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db
      .query("orders")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .collect();

    if (args.status) {
      orders = orders.filter((o) => o.status === args.status);
    }

    return orders;
  },
});

export const getByCustomer = query({
  args: { customerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { status: args.status });
  },
});

export const getStats = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();

    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    // Monthly revenue for charts
    const monthlyRevenue: Record<string, number> = {};
    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        const date = new Date(o._creationTime);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.total;
      });

    // Top products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        o.items.forEach((item) => {
          const id = item.productId;
          if (!productSales[id]) {
            productSales[id] = { name: item.name, quantity: 0, revenue: 0 };
          }
          productSales[id].quantity += item.quantity;
          productSales[id].revenue += item.price * item.quantity;
        });
      });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      monthlyRevenue: Object.entries(monthlyRevenue)
        .sort()
        .map(([month, revenue]) => ({ month, revenue })),
      topProducts,
    };
  },
});
