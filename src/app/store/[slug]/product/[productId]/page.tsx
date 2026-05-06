"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/use-cart";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { ProductImageOrPlaceholder, StorefrontProductImage } from "@/components/storefront/product-image";
import { StoreHeader } from "@/components/storefront/store-header";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const productId = params.productId as string;

  const store = useQuery(api.stores.getBySlug, { slug });
  const product = useQuery(api.products.getById, {
    productId: productId as Id<"products">,
  });

  // Get related products
  const relatedProducts = useQuery(
    api.products.getPublished,
    store && product
      ? { storeId: store._id, category: product.category }
      : "skip"
  );

  const addToCart = useMutation(api.cart.addItem);
  const { getSessionId } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = async () => {
    if (!store || !product) return;
    await addToCart({
      sessionId: getSessionId(),
      storeId: store._id,
      productId: product._id,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product || !store) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const filteredRelated = relatedProducts?.filter((p) => p._id !== product._id).slice(0, 4) ?? [];

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader
        storeName={store.name}
        storeSlug={slug}
        storeInitial={store.name.charAt(0)}
        primaryColor={store.theme.primaryColor}
        accentColor={store.theme.accentColor}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              {product.images.length > 0 ? (
                <StorefrontProductImage
                  storageId={product.images[selectedImage]}
                  alt={product.name}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="transition-all duration-300"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-32 w-32 text-gray-200" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((imgId, index) => (
                  <button
                    key={imgId}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-indigo-500 ring-1 ring-indigo-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <StorefrontProductImage
                      storageId={imgId}
                      alt={`${product.name} ${index + 1}`}
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3">{product.category}</Badge>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                {product.name}
              </h1>
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-3xl font-semibold tracking-tight text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <Badge variant="destructive">
                      {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Stock */}
            <div>
              {product.inventory > 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>In Stock ({product.inventory} available)</span>
                </div>
              ) : (
                <p className="text-sm text-red-600">Out of Stock</p>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-gray-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={product.inventory === 0 || added}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="flex flex-col items-center gap-2 text-center">
                <Truck className="h-5 w-5 text-gray-400" />
                <span className="text-xs text-gray-500">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-xs text-gray-500">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <RotateCcw className="h-5 w-5 text-gray-400" />
                <span className="text-xs text-gray-500">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {filteredRelated.map((rp) => (
                <Link key={rp._id} href={`/store/${slug}/product/${rp._id}`}>
                  <Card className="group cursor-pointer overflow-hidden border-gray-100 hover:shadow-md transition-all">
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <ProductImageOrPlaceholder
                        images={rp.images}
                        name={rp.name}
                        iconSize="h-10 w-10"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-xs font-semibold text-gray-900 truncate">{rp.name}</h3>
                      <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(rp.price)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
