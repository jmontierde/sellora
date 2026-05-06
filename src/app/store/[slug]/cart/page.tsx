"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/use-cart";
import { ProductImageOrPlaceholder } from "@/components/storefront/product-image";
import { StoreHeader } from "@/components/storefront/store-header";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";

export default function CartPage() {
  const params = useParams();
  const slug = params.slug as string;
  const store = useQuery(api.stores.getBySlug, { slug });
  const { getSessionId } = useCartStore();
  const sessionId = getSessionId();

  const cartItems = useQuery(api.cart.getItems, { sessionId });
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);

  // Filter cart items to current store
  const storeItems = cartItems?.filter((item) => item.storeId === store?._id) ?? [];

  const subtotal = storeItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

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

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Your Cart</h1>
          {storeItems.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {storeItems.length} item{storeItems.length !== 1 ? "s" : ""} ready to check out
            </p>
          )}
        </div>
        {storeItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              {storeItems.map((item) => (
                <Card key={item._id} className="border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        <ProductImageOrPlaceholder
                          images={item.product?.images ?? []}
                          name={item.product?.name ?? "Product"}
                          iconSize="h-8 w-8"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {item.product?.name}
                        </h3>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {formatPrice(item.product?.price ?? 0)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center rounded-lg border border-gray-200">
                            <button
                              onClick={() =>
                                updateQuantity({
                                  itemId: item._id,
                                  quantity: item.quantity - 1,
                                })
                              }
                              className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-700"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity({
                                  itemId: item._id,
                                  quantity: item.quantity + 1,
                                })
                              }
                              className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-700"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem({ itemId: item._id })}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice((item.product?.price ?? 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border-gray-100 sticky top-6">
                <CardContent className="p-5">
                  <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-emerald-600 font-medium">Free</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                  <Link href={`/store/${slug}/checkout`} className="mt-6 block">
                    <Button className="w-full gap-2" size="lg">
                      <ShoppingBag className="h-4 w-4" />
                      Checkout
                    </Button>
                  </Link>
                  <Link href={`/store/${slug}`} className="mt-3 block">
                    <Button variant="outline" className="w-full" size="sm">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-1.5 max-w-sm text-sm text-gray-500">
              Browse products and add them to your cart to start your order
            </p>
            <Link href={`/store/${slug}`} className="mt-6">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
