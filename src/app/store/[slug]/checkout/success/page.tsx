"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function CheckoutSuccessPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isSignedIn } = useUser();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>
      <Card className="relative w-full max-w-md animate-scale-in">
        <CardContent className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/30">
              <CheckCircle className="h-10 w-10 text-white" />
              <div className="absolute -inset-2 -z-10 animate-pulse-soft rounded-2xl bg-emerald-400/30 blur-md" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Order Confirmed
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Thank you for your purchase. Your order has been placed successfully
            and is being processed.
          </p>

          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="h-4 w-4 text-gray-400" />
              <span>You&apos;ll receive a confirmation email shortly</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShoppingBag className="h-4 w-4 text-gray-400" />
              <span>Free standard shipping (3-5 business days)</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {isSignedIn && (
              <Link href={`/store/${slug}/orders`} className="block">
                <Button className="w-full gap-2">
                  <Package className="h-4 w-4" />
                  View My Orders
                </Button>
              </Link>
            )}
            <Link href={`/store/${slug}`} className="block">
              <Button variant="outline" className="w-full gap-2">
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
