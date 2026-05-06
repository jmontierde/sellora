"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Package, Loader2 } from "lucide-react";
import Image from "next/image";

export function StorefrontProductImage({
  storageId,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, 25vw",
}: {
  storageId: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const url = useQuery(api.files.getUrl, { storageId });

  if (!url) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 text-gray-300 animate-spin" />
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      sizes={sizes}
    />
  );
}

export function ProductImageOrPlaceholder({
  images,
  name,
  iconSize = "h-16 w-16",
  sizes,
}: {
  images: string[];
  name: string;
  iconSize?: string;
  sizes?: string;
}) {
  if (images.length > 0) {
    return <StorefrontProductImage storageId={images[0]} alt={name} sizes={sizes} />;
  }
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Package className={`${iconSize} text-gray-200`} />
    </div>
  );
}
