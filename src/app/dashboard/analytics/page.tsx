"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { useStoreState } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

export default function AnalyticsPage() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrent, {
    clerkId: user?.id ?? "",
  });
  const stores = useQuery(
    api.stores.getByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const { activeStoreId } = useStoreState();
  const activeStore = stores?.find((s) => s._id === activeStoreId) ?? stores?.[0];

  const stats = useQuery(
    api.orders.getStats,
    activeStore ? { storeId: activeStore._id } : "skip"
  );
  const products = useQuery(
    api.products.getByStore,
    activeStore ? { storeId: activeStore._id } : "skip"
  );

  // Category breakdown
  const categoryData = products
    ? Object.entries(
        products.reduce(
          (acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      ).map(([name, value]) => ({ name, value }))
    : [];

  const revenueData = stats?.monthlyRevenue.map((item) => ({
    ...item,
    revenue: item.revenue / 100,
  })) ?? [];

  const summaryCards = [
    {
      label: "Revenue",
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      label: "Products",
      value: products?.length ?? 0,
      icon: Package,
      gradient: "from-violet-500 to-fuchsia-500",
    },
    {
      label: "Avg. Order",
      value:
        stats && stats.totalOrders > 0
          ? formatPrice(stats.totalRevenue / stats.totalOrders)
          : "$0.00",
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Insights</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Analytics</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Track your store performance over time
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-md`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{s.label}</p>
                  <p className="text-xl font-semibold tracking-tight text-gray-900">
                    {s.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="border-gray-100">
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-sm text-gray-500">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="border-gray-100">
          <CardHeader>
            <CardTitle className="text-base">Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="text-sm font-medium text-gray-900">({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-sm text-gray-500">
                No product data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="text-base">Top Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topProducts && stats.topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.topProducts.map((product, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{product.quantity}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                        {formatPrice(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No sales data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
