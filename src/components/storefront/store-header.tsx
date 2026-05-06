"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/use-cart";
import { ShoppingCart, Package, User } from "lucide-react";
import { useEffect } from "react";

interface StoreHeaderProps {
  storeName: string;
  storeSlug: string;
  storeInitial: string;
  storeDescription?: string;
  primaryColor: string;
  accentColor: string;
}

export function StoreHeader({
  storeName,
  storeSlug,
  storeInitial,
  storeDescription,
  primaryColor,
  accentColor,
}: StoreHeaderProps) {
  const { user, isSignedIn } = useUser();
  const getOrCreate = useMutation(api.users.getOrCreate);
  const { getSessionId } = useCartStore();
  const sessionId = getSessionId();
  const cartItems = useQuery(api.cart.getItems, { sessionId });

  const storeFromDb = useQuery(api.stores.getBySlug, { slug: storeSlug });
  const storeCartCount =
    cartItems?.filter((item) => item.storeId === storeFromDb?._id)
      .reduce((sum, item) => sum + item.quantity, 0) ?? 0;

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

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/75 backdrop-blur-xl">
      <div
        className="absolute inset-0 -z-10 opacity-50"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}10, ${accentColor}10)`,
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/store/${storeSlug}`} className="group flex min-w-0 items-center gap-3">
            <div
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white text-lg font-semibold tracking-tight shadow-md transition-transform group-hover:scale-[1.04]"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                boxShadow: `0 6px 20px -8px ${primaryColor}80`,
              }}
            >
              {storeInitial}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-white/15" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                {storeName}
              </h1>
              {storeDescription && (
                <p className="truncate text-xs text-gray-500 hidden sm:block">{storeDescription}</p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isSignedIn && (
              <Link href={`/store/${storeSlug}/orders`}>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Orders</span>
                </Button>
              </Link>
            )}

            <Link href={`/store/${storeSlug}/cart`}>
              <Button variant="outline" size="sm" className="gap-1.5 relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {storeCartCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {storeCartCount > 99 ? "99+" : storeCartCount}
                  </span>
                )}
              </Button>
            </Link>

            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-white shadow-xs",
                  },
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" variant="ghost" className="gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
