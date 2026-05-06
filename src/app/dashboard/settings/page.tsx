"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { useStoreState } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Palette, CreditCard, Trash2, ExternalLink, Check, Star } from "lucide-react";
import { useState, useEffect } from "react";

type Plan = "free" | "pro" | "enterprise";

const PLAN_OPTIONS: {
  id: Plan;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: ["1 Store", "Basic Analytics", "AI Chatbot"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    description: "For growing businesses",
    features: ["5 Stores", "Advanced Analytics", "AI Product Descriptions", "Priority Support"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    description: "For large-scale operations",
    features: ["50 Stores", "Full Analytics Suite", "All AI Features", "Dedicated Support"],
  },
];

export default function SettingsPage() {
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
  const updateStore = useMutation(api.stores.update);
  const deleteStore = useMutation(api.stores.remove);
  const updateSubscription = useMutation(api.users.updateSubscription);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [accentColor, setAccentColor] = useState("#8b5cf6");
  const [saving, setSaving] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState<Plan | null>(null);

  const handleSelectPlan = async (plan: Plan) => {
    if (!currentUser || currentUser.subscriptionPlan === plan) {
      setPlanDialogOpen(false);
      return;
    }
    setUpdatingPlan(plan);
    try {
      await updateSubscription({ userId: currentUser._id, subscriptionPlan: plan });
      setPlanDialogOpen(false);
    } catch (error) {
      console.error("Failed to update plan:", error);
    }
    setUpdatingPlan(null);
  };

  useEffect(() => {
    if (activeStore) {
      setName(activeStore.name);
      setDescription(activeStore.description ?? "");
      setPrimaryColor(activeStore.theme.primaryColor);
      setAccentColor(activeStore.theme.accentColor);
    }
  }, [activeStore]);

  const handleSave = async () => {
    if (!activeStore) return;
    setSaving(true);
    await updateStore({
      storeId: activeStore._id,
      name,
      description,
      theme: { primaryColor, accentColor },
    });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!activeStore || !confirm("Are you sure you want to delete this store? This action cannot be undone.")) return;
    await deleteStore({ storeId: activeStore._id });
  };

  if (!activeStore) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Select a store to manage settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Configuration</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Customize your store appearance and subscription
        </p>
      </div>

      {/* General */}
      <Card className="border-gray-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-base">General</CardTitle>
          </div>
          <CardDescription>Basic store information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Store Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Store URL</label>
            <div className="mt-1 flex items-center gap-2">
              <Input value={`/store/${activeStore.slug}`} disabled className="bg-gray-50" />
              <a href={`/store/${activeStore.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="border-gray-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-base">Theme</CardTitle>
          </div>
          <CardDescription>Customize your store colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Primary Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Accent Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${accentColor}15)` }}>
            <p className="text-sm font-medium" style={{ color: primaryColor }}>Preview</p>
            <p className="text-xs mt-1" style={{ color: accentColor }}>This is how your theme colors look</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="border-gray-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-base">Subscription</CardTitle>
          </div>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {currentUser?.subscriptionPlan ?? "free"} Plan
                </p>
                <Badge variant="default" className="capitalize">
                  {currentUser?.subscriptionPlan ?? "free"}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {currentUser?.subscriptionPlan === "free"
                  ? "Upgrade to unlock more features"
                  : "Your plan is active"}
              </p>
            </div>
            <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Manage Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Choose your plan</DialogTitle>
                  <DialogDescription>
                    Pick the plan that fits your needs. Changes take effect immediately.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4">
                  {PLAN_OPTIONS.map((plan) => {
                    const isCurrent = currentUser?.subscriptionPlan === plan.id;
                    const isUpdating = updatingPlan === plan.id;
                    return (
                      <Card
                        key={plan.id}
                        className={`relative ${plan.popular ? "border-indigo-200 ring-1 ring-indigo-100" : ""}`}
                      >
                        {plan.popular && (
                          <div className="absolute right-3 top-3">
                            <div className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                              <Star className="h-3 w-3 fill-indigo-600" />
                              Popular
                            </div>
                          </div>
                        )}
                        <CardContent className="p-5">
                          <h4 className="text-base font-semibold text-gray-900">{plan.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                          <div className="mt-3">
                            <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                            <span className="text-xs text-gray-500">/month</span>
                          </div>
                          <ul className="mt-4 space-y-2">
                            {plan.features.map((f) => (
                              <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                                <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <Button
                            className="w-full mt-5"
                            size="sm"
                            variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                            disabled={isCurrent || updatingPlan !== null}
                            onClick={() => handleSelectPlan(plan.id)}
                          >
                            {isCurrent
                              ? "Current Plan"
                              : isUpdating
                                ? "Updating..."
                                : `Switch to ${plan.name}`}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Delete Store
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
