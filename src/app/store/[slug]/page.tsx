"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  ShoppingBag,
  Package,
  MessageCircle,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { AIChatWidget } from "@/components/ai/chat-widget";
import { ProductImageOrPlaceholder } from "@/components/storefront/product-image";
import { StoreHeader } from "@/components/storefront/store-header";

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const store = useQuery(api.stores.getBySlug, { slug });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showChat, setShowChat] = useState(false);

  const products = useQuery(
    api.products.getPublished,
    store
      ? {
          storeId: store._id,
          searchQuery: searchQuery || undefined,
          category: selectedCategory || undefined,
        }
      : "skip"
  );

  const categories = useQuery(
    api.products.getCategories,
    store ? { storeId: store._id } : "skip"
  );

  if (store === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (store === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Store Not Found</h1>
        <p className="text-gray-500 mt-2">This store doesn&apos;t exist or has been removed.</p>
        <Link href="/" className="mt-6">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader
        storeName={store.name}
        storeSlug={slug}
        storeInitial={store.name.charAt(0)}
        storeDescription={store.description}
        primaryColor={store.theme.primaryColor}
        accentColor={store.theme.accentColor}
      />

      {/* Hero band */}
      <div className="relative overflow-hidden border-b border-gray-100">
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            background: `radial-gradient(ellipse at top, ${store.theme.primaryColor}25, transparent 65%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Welcome to <span style={{ color: store.theme.primaryColor }}>{store.name}</span>
          </h2>
          {store.description && (
            <p className="mt-3 max-w-xl text-balance text-base leading-relaxed text-gray-600">
              {store.description}
            </p>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-[73px] z-30 border-b border-gray-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="pl-9"
              />
            </div>
            {categories && categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <Filter className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap ${
                    !selectedCategory
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 pb-20 sm:px-6">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Link key={product._id} href={`/store/${slug}/product/${product._id}`}>
                <Card className="group cursor-pointer overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <ProductImageOrPlaceholder
                      images={product.images}
                      name={product.name}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {product.compareAtPrice && (
                      <div className="absolute left-3 top-3">
                        <Badge variant="destructive">
                          -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                        </Badge>
                      </div>
                    )}
                    {product.inventory <= 5 && product.inventory > 0 && (
                      <div className="absolute right-3 top-3">
                        <Badge variant="warning">Only {product.inventory} left</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      {product.category}
                    </p>
                    <h3
                      className="mt-1 line-clamp-1 text-sm font-semibold tracking-tight text-gray-900 transition-colors"
                      style={{ /* hover via group */ }}
                    >
                      {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                      {product.description}
                    </p>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-base font-semibold tracking-tight text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-gray-900">
              No products found
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              {searchQuery
                ? "Try a different search term"
                : "This store hasn't added products yet"}
            </p>
          </div>
        )}
      </div>

      {/* AI Chat FAB */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${store.theme.primaryColor}, ${store.theme.accentColor})`,
          boxShadow: `0 14px 30px -8px ${store.theme.primaryColor}80`,
        }}
        aria-label="Open AI chat"
      >
        <span
          className="absolute inset-0 -z-10 rounded-full opacity-50 blur-md animate-pulse-soft"
          style={{
            background: `linear-gradient(135deg, ${store.theme.primaryColor}, ${store.theme.accentColor})`,
          }}
        />
        <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
      </button>

      {showChat && store && (
        <AIChatWidget storeId={store._id} storeName={store.name} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}
