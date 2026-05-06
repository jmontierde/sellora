"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/use-cart";
import { ProductImageOrPlaceholder } from "@/components/storefront/product-image";
import { StoreHeader } from "@/components/storefront/store-header";
import { Lock, User, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isSignedIn, isLoaded } = useUser();

  const store = useQuery(api.stores.getBySlug, { slug });

  // Sync customer user record
  const getOrCreate = useMutation(api.users.getOrCreate);
  const currentUser = useQuery(api.users.getCurrent, {
    clerkId: user?.id ?? "",
  });

  useEffect(() => {
    if (user && isSignedIn) {
      getOrCreate({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        name: user.fullName ?? user.firstName ?? "Customer",
        imageUrl: user.imageUrl,
      });
    }
  }, [user, isSignedIn, getOrCreate]);

  const { getSessionId } = useCartStore();
  const sessionId = getSessionId();
  const cartItems = useQuery(api.cart.getItems, { sessionId });
  const createOrder = useMutation(api.orders.create);
  const clearCart = useMutation(api.cart.clearCart);

  const storeItems = cartItems?.filter((item) => item.storeId === store?._id) ?? [];
  const subtotal = storeItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [processing, setProcessing] = useState(false);

  // Pre-fill form when user signs in
  useEffect(() => {
    if (user && isSignedIn) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.fullName || user.firstName || "",
        email: prev.email || user.emailAddresses[0]?.emailAddress || "",
      }));
    }
  }, [user, isSignedIn]);

  const handleCheckout = async () => {
    if (!store || storeItems.length === 0) return;
    setProcessing(true);

    try {
      await createOrder({
        storeId: store._id,
        customerId: currentUser?._id,
        customerEmail: form.email,
        customerName: form.name,
        items: storeItems.map((item) => ({
          productId: item.productId,
          name: item.product?.name ?? "",
          price: item.product?.price ?? 0,
          quantity: item.quantity,
        })),
        total: subtotal,
        shippingAddress: {
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
      });

      await clearCart({ sessionId });
      router.push(`/store/${slug}/checkout/success`);
    } catch (error) {
      console.error("Checkout failed:", error);
    }
    setProcessing(false);
  };

  if (!store) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
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
        {/* Sign-in prompt for guests */}
        {isLoaded && !isSignedIn && (
          <Card className="border-indigo-100 bg-indigo-50/50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Sign in for a faster checkout
                    </p>
                    <p className="text-xs text-gray-500">
                      Track your orders and save your details for next time
                    </p>
                  </div>
                </div>
                <SignInButton mode="modal">
                  <Button size="sm" className="gap-1.5">
                    <LogIn className="h-3.5 w-3.5" />
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Checkout Form */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-gray-100">
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100">
              <CardHeader>
                <CardTitle className="text-base">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Address Line 1</label>
                  <Input
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    placeholder="123 Main St"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Address Line 2</label>
                  <Input
                    value={form.line2}
                    onChange={(e) => setForm({ ...form, line2: e.target.value })}
                    placeholder="Apt 4B (optional)"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <Input
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ZIP Code</label>
                    <Input
                      value={form.zip}
                      onChange={(e) => setForm({ ...form, zip: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <Input
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="border-gray-100 sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {storeItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-md bg-gray-100 overflow-hidden shrink-0">
                      <ProductImageOrPlaceholder
                        images={item.product?.images ?? []}
                        name={item.product?.name ?? "Product"}
                        iconSize="h-5 w-5"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice((item.product?.price ?? 0) * item.quantity)}
                    </p>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-emerald-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
                  </div>
                </div>
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={
                    processing ||
                    storeItems.length === 0 ||
                    !form.name ||
                    !form.email ||
                    !form.line1 ||
                    !form.city ||
                    !form.state ||
                    !form.zip
                  }
                >
                  <Lock className="h-4 w-4" />
                  {processing ? "Processing..." : `Pay ${formatPrice(subtotal)}`}
                </Button>
                <p className="text-[10px] text-gray-400 text-center">
                  Secure checkout powered by Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
