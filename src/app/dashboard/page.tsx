"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useStoreState } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  ExternalLink,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { slugify } from "@/lib/utils";

export default function DashboardPage() {
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
  const recentOrders = useQuery(
    api.orders.getByStore,
    activeStore ? { storeId: activeStore._id } : "skip"
  );

  const createStore = useMutation(api.stores.create);
  const [newStoreName, setNewStoreName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateStore = async () => {
    if (!currentUser || !newStoreName.trim()) return;
    setIsCreating(true);
    try {
      await createStore({
        userId: currentUser._id,
        name: newStoreName.trim(),
        slug: slugify(newStoreName.trim()),
      });
      setNewStoreName("");
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to create store:", error);
    }
    setIsCreating(false);
  };

  if (!stores) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // ─── Empty: no stores ───
  if (stores.length === 0) {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/40 blur-3xl" />
        </div>
        <div className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30">
          <Package className="h-10 w-10 text-white" />
          <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          </div>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          Create Your First Store
        </h2>
        <p className="mt-3 max-w-md text-balance leading-relaxed text-gray-500">
          Get started by creating your first online store. You can always
          customize the look and feel later.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="mt-7 gap-2">
              <Plus className="h-4 w-4" />
              Create Store
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new store</DialogTitle>
              <DialogDescription>
                Pick a name to get started. You can change it later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Store name</label>
                <Input
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="My Awesome Store"
                  className="mt-1.5"
                />
                {newStoreName && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    URL: <span className="font-mono text-gray-700">/store/{slugify(newStoreName)}</span>
                  </p>
                )}
              </div>
              <Button
                onClick={handleCreateStore}
                disabled={!newStoreName.trim() || isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? "Creating…" : "Create Store"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      change: "+12.5%",
      trend: "up" as const,
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      gradient: "from-indigo-500 to-violet-500",
      change: "+8.2%",
      trend: "up" as const,
    },
    {
      title: "Products",
      value: products?.length ?? 0,
      icon: Package,
      gradient: "from-violet-500 to-fuchsia-500",
      change: "+3 new",
      trend: "up" as const,
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      change: "Needs attention",
      trend: "down" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Here&apos;s what&apos;s happening with{" "}
            <span className="font-medium text-gray-700">{activeStore?.name}</span> today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeStore && (
            <a
              href={`/store/${activeStore.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                View Store
              </Button>
            </a>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                New Store
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new store</DialogTitle>
                <DialogDescription>
                  Add another storefront to your workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Store name</label>
                  <Input
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="My Awesome Store"
                    className="mt-1.5"
                  />
                </div>
                <Button
                  onClick={handleCreateStore}
                  disabled={!newStoreName.trim() || isCreating}
                  className="w-full"
                >
                  {isCreating ? "Creating…" : "Create Store"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="group relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    stat.trend === "up"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500">{stat.title}</p>
              <p className="mt-0.5 text-2xl font-semibold tracking-tight text-gray-900">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Two columns ─── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Recent Orders */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <p className="mt-0.5 text-xs text-gray-500">Latest 5 orders</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-1">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-xs font-semibold text-indigo-700">
                      {order.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "success"
                          : order.status === "cancelled"
                            ? "destructive"
                            : order.status === "pending"
                              ? "warning"
                              : "default"
                      }
                    >
                      {order.status}
                    </Badge>
                    <p className="ml-2 text-sm font-semibold text-gray-900 tabular-nums">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center">
                <ShoppingCart className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-700">No orders yet</p>
                <p className="mt-1 text-xs text-gray-500">
                  Share your store to start selling
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Top Products</CardTitle>
            <p className="mt-0.5 text-xs text-gray-500">By revenue</p>
          </CardHeader>
          <CardContent>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-1">
                {stats.topProducts.map((product, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-50 to-violet-50 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.quantity} sold</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 tabular-nums">
                      {formatPrice(product.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center">
                <Package className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-700">No data yet</p>
                <p className="mt-1 text-xs text-gray-500">
                  Add products to start tracking
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
