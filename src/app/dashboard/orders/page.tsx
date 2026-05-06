"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { useStoreState } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, ChevronDown } from "lucide-react";
import { useState } from "react";

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

const statusColors: Record<string, "default" | "warning" | "success" | "destructive" | "secondary"> = {
  pending: "warning",
  processing: "default",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
};

export default function OrdersPage() {
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

  const [filterStatus, setFilterStatus] = useState<typeof statusOptions[number] | undefined>();
  const orders = useQuery(
    api.orders.getByStore,
    activeStore
      ? { storeId: activeStore._id, status: filterStatus }
      : "skip"
  );

  const updateStatus = useMutation(api.orders.updateStatus);

  const handleStatusChange = async (orderId: string, newStatus: typeof statusOptions[number]) => {
    await updateStatus({ orderId: orderId as any, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Sales</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Orders</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Manage and track customer orders
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white p-1 w-fit shadow-xs">
        <button
          onClick={() => setFilterStatus(undefined)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            !filterStatus
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          All
        </button>
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
              filterStatus === status
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-semibold text-indigo-700">
                      {order.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold tracking-tight text-gray-900">
                          {order.customerName}
                        </h3>
                        <Badge variant={statusColors[order.status]}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{order.customerEmail}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(order._creationTime)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                    <div className="relative mt-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value as any)}
                        className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status} className="capitalize">
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-gray-400">x{item.quantity}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Shipping Address</p>
                  <p className="text-xs text-gray-700">
                    {order.shippingAddress.line1}
                    {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`},{" "}
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zip}, {order.shippingAddress.country}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Package className="h-7 w-7 text-white" />
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-gray-900">
            No orders yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Orders will appear here when customers purchase from your store
          </p>
        </div>
      )}
    </div>
  );
}
