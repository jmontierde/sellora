"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { useStoreState } from "@/hooks/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import {
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ImagePlus,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import Image from "next/image";

function ProductImage({ storageId }: { storageId: string }) {
  const url = useQuery(api.files.getUrl, { storageId });
  if (!url) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-5 w-5 text-gray-300 animate-spin" />
      </div>
    );
  }
  return (
    <Image
      src={url}
      alt="Product"
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 33vw"
    />
  );
}

export default function ProductsPage() {
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

  const [searchQuery, setSearchQuery] = useState("");
  const products = useQuery(
    api.products.getByStore,
    activeStore ? { storeId: activeStore._id, searchQuery: searchQuery || undefined } : "skip"
  );

  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteFile = useMutation(api.files.deleteFile);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "",
    tags: "",
    inventory: "",
    isPublished: true,
  });
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      compareAtPrice: "",
      category: "",
      tags: "",
      inventory: "",
      isPublished: true,
    });
    setImageIds([]);
    setEditingProduct(null);
  };

  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setIsUploading(true);

      const newIds: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) {
          alert(`File "${file.name}" exceeds 5MB limit.`);
          continue;
        }

        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        newIds.push(storageId);
      }

      setImageIds((prev) => [...prev, ...newIds]);
      setIsUploading(false);
    },
    [generateUploadUrl]
  );

  const handleRemoveImage = async (storageId: string) => {
    setImageIds((prev) => prev.filter((id) => id !== storageId));
    try {
      await deleteFile({ storageId });
    } catch {
      // File may already be deleted, ignore
    }
  };

  const handleSubmit = async () => {
    if (!activeStore) return;
    const data = {
      name: form.name,
      description: form.description,
      price: Math.round(parseFloat(form.price) * 100),
      compareAtPrice: form.compareAtPrice
        ? Math.round(parseFloat(form.compareAtPrice) * 100)
        : undefined,
      images: imageIds,
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      inventory: parseInt(form.inventory) || 0,
      isPublished: form.isPublished,
    };

    if (editingProduct) {
      await updateProduct({ productId: editingProduct, ...data });
    } else {
      await createProduct({ storeId: activeStore._id, ...data });
    }
    resetForm();
    setDialogOpen(false);
  };

  const handleEdit = (product: NonNullable<typeof products>[number]) => {
    setEditingProduct(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: (product.price / 100).toString(),
      compareAtPrice: product.compareAtPrice
        ? (product.compareAtPrice / 100).toString()
        : "",
      category: product.category,
      tags: product.tags.join(", "),
      inventory: product.inventory.toString(),
      isPublished: product.isPublished,
    });
    setImageIds(product.images);
    setDialogOpen(true);
  };

  const handleGenerateDescription = async () => {
    if (!form.name) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: form.name,
          category: form.category,
          tags: form.tags,
        }),
      });
      const data = await res.json();
      if (data.description) {
        setForm((prev) => ({ ...prev, description: data.description }));
      }
    } catch (error) {
      console.error("Failed to generate description:", error);
    }
    setIsGenerating(false);
  };

  const togglePublish = async (productId: Id<"products">, isPublished: boolean) => {
    await updateProduct({ productId, isPublished: !isPublished });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Catalog</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Products</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Manage your product catalog and inventory
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700">Product Images</label>
                <div className="mt-2">
                  {/* Image Preview Grid */}
                  {imageIds.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {imageIds.map((storageId, index) => (
                        <div
                          key={storageId}
                          className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                        >
                          <ProductImage storageId={storageId} />
                          {index === 0 && (
                            <span className="absolute top-1.5 left-1.5 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              Main
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(storageId)}
                            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleImageUpload(e.dataTransfer.files);
                    }}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-2" />
                        <p className="text-sm font-medium text-gray-600">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 mb-3">
                          <ImagePlus className="h-6 w-6 text-indigo-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, WEBP up to 5MB each
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Product Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Premium Wireless Headphones"
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={!form.name || isGenerating}
                    className="gap-1.5 text-indigo-600 hover:text-indigo-700"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isGenerating ? "Generating..." : "AI Generate"}
                  </Button>
                </div>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="29.99"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Compare at Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                    placeholder="39.99"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Electronics"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Inventory</label>
                  <Input
                    type="number"
                    value={form.inventory}
                    onChange={(e) => setForm({ ...form, inventory: e.target.value })}
                    placeholder="100"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Tags (comma separated)</label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="wireless, bluetooth, premium"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <label htmlFor="published" className="text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>

              <Button onClick={handleSubmit} disabled={isUploading} className="w-full">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading images...
                  </>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      {/* Product Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product._id}
              className="group overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {product.images.length > 0 ? (
                  <ProductImage storageId={product.images[0]} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                  <Badge variant={product.isPublished ? "success" : "secondary"}>
                    {product.isPublished ? "Live" : "Draft"}
                  </Badge>
                  {product.images.length > 1 && (
                    <span className="rounded-md bg-gray-900/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                      +{product.images.length - 1}
                    </span>
                  )}
                </div>
                {/* hover action overlay */}
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-gray-950/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="glass"
                    size="icon-sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="glass"
                    size="icon-sm"
                    onClick={() => togglePublish(product._id, product.isPublished)}
                  >
                    {product.isPublished ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="glass"
                    size="icon-sm"
                    className="ml-auto text-rose-200 hover:!text-rose-100"
                    onClick={() => deleteProduct({ productId: product._id })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <Badge variant="outline" className="mb-2 text-[10px]">
                  {product.category}
                </Badge>
                <h3 className="truncate text-sm font-semibold tracking-tight text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                  {product.description}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-semibold tracking-tight text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      product.inventory > 5
                        ? "text-gray-500"
                        : product.inventory > 0
                          ? "text-amber-600"
                          : "text-rose-600"
                    }`}
                  >
                    {product.inventory > 0
                      ? `${product.inventory} in stock`
                      : "Out of stock"}
                  </span>
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
            No products yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Add your first product to start building your catalog
          </p>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="mt-5 gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </Button>
        </div>
      )}
    </div>
  );
}
