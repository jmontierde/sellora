"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { useStoreState } from "@/hooks/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Users, Mail, ShoppingBag } from "lucide-react";

export default function CustomersPage() {
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

  const orders = useQuery(
    api.orders.getByStore,
    activeStore ? { storeId: activeStore._id } : "skip"
  );

  // Derive customers from orders
  const customers = orders
    ? Object.values(
        orders.reduce(
          (acc, order) => {
            const key = order.customerEmail;
            if (!acc[key]) {
              acc[key] = {
                email: order.customerEmail,
                name: order.customerName,
                orderCount: 0,
                totalSpent: 0,
                lastOrder: order._creationTime,
              };
            }
            acc[key].orderCount++;
            acc[key].totalSpent += order.total;
            if (order._creationTime > acc[key].lastOrder) {
              acc[key].lastOrder = order._creationTime;
            }
            return acc;
          },
          {} as Record<
            string,
            {
              email: string;
              name: string;
              orderCount: number;
              totalSpent: number;
              lastOrder: number;
            }
          >
        )
      ).sort((a, b) => b.totalSpent - a.totalSpent)
    : [];

  const summaryStats = [
    {
      label: "Total Customers",
      value: customers.length,
      icon: Users,
      gradient: "from-blue-500 to-sky-500",
    },
    {
      label: "Avg. Order Value",
      value:
        orders && orders.length > 0
          ? formatPrice(orders.reduce((sum, o) => sum + o.total, 0) / orders.length)
          : "$0.00",
      icon: ShoppingBag,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Repeat Customers",
      value: customers.filter((c) => c.orderCount > 1).length,
      icon: Mail,
      gradient: "from-violet-500 to-fuchsia-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">People</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Customers</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          View customer activity and spending insights
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryStats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer List */}
      {customers.length > 0 ? (
        <Card className="border-gray-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Order
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((customer) => (
                    <tr key={customer.email} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{customer.orderCount}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {formatPrice(customer.totalSpent)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(customer.lastOrder)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={customer.orderCount > 1 ? "success" : "secondary"}>
                          {customer.orderCount > 1 ? "Returning" : "New"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 shadow-lg shadow-blue-500/30">
            <Users className="h-7 w-7 text-white" />
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-gray-900">
            No customers yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Customers will show up here once they place their first order
          </p>
        </div>
      )}
    </div>
  );
}
