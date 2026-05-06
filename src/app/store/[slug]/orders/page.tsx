"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, ShoppingBag, LogIn, User } from "lucide-react";
import { StoreHeader } from "@/components/storefront/store-header";

const statusColors: Record<string, "default" | "warning" | "success" | "destructive"> = {
  pending: "warning",
  processing: "default",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
};

export default function OrderHistoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isSignedIn, isLoaded } = useUser();

  const store = useQuery(api.stores.getBySlug, { slug });

  const currentUser = useQuery(
    api.users.getCurrent,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const orders = useQuery(
    api.orders.getByCustomer,
    currentUser ? { customerId: currentUser._id } : "skip"
  );

  // Filter orders to current store
  const storeOrders = orders?.filter((o) => o.storeId === store?._id) ?? [];

  if (!store) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Not signed in
  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StoreHeader
          storeName={store.name}
          storeSlug={slug}
          storeInitial={store.name.charAt(0)}
          primaryColor={store.theme.primaryColor}
          accentColor={store.theme.accentColor}
        />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 mb-6">
            <User className="h-10 w-10 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Sign in to view your orders</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            Create an account or sign in to track your orders and get updates on your purchases.
          </p>
          <SignInButton mode="modal">
            <Button className="mt-6 gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader
        storeName={store.name}
        storeSlug={slug}
        storeInitial={store.name.charAt(0)}
        primaryColor={store.theme.primaryColor}
        accentColor={store.theme.accentColor}
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">My Orders</h2>

        {storeOrders.length > 0 ? (
          <div className="space-y-4">
            {storeOrders.map((order) => (
              <Card key={order._id} className="border-gray-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        {formatDate(order._creationTime)}
                      </p>
                      <Badge variant={statusColors[order.status]} className="mt-1 capitalize">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-900">{item.name}</span>
                          <span className="text-gray-400 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">No orders yet</h2>
            <p className="text-sm text-gray-500 mt-2">Your order history will appear here</p>
            <Link href={`/store/${slug}`} className="mt-6">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
