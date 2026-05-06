"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useStoreState } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Store,
  ChevronsUpDown,
  Sparkles,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrent, {
    clerkId: user?.id ?? "",
  });
  const stores = useQuery(
    api.stores.getByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const { activeStoreId, setActiveStore } = useStoreState();

  const activeStore = stores?.find((s) => s._id === activeStoreId) ?? stores?.[0];
  const planLabel = currentUser?.subscriptionPlan ?? "free";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200/70 bg-white/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-100 px-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/sellora-logo.png"
            alt="Sellora"
            width={677}
            height={369}
            priority
            className="h-15  w-auto"
          />
        </Link>
        <Badge variant="default" className="ml-auto capitalize">
          {planLabel}
        </Badge>
      </div>

      {/* Store Selector */}
      <div className="px-3 pt-4">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Store
        </p>
        <button className="group flex w-full items-center gap-2.5 rounded-lg border border-gray-200/80 bg-white px-3 py-2.5 text-left text-sm shadow-xs transition-colors hover:border-gray-300 hover:bg-gray-50">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-100 to-violet-100 text-xs font-semibold text-indigo-700">
            {activeStore ? activeStore.name.charAt(0).toUpperCase() : <Store className="h-3.5 w-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {activeStore?.name ?? "No store"}
            </p>
            <p className="truncate text-[11px] text-gray-500">
              {activeStore ? `/store/${activeStore.slug}` : "Create your first"}
            </p>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
        </button>
        {stores && stores.length > 1 && (
          <div className="mt-1.5 space-y-0.5 px-1">
            {stores
              .filter((s) => s._id !== activeStore?._id)
              .map((store) => (
                <button
                  key={store._id}
                  onClick={() => setActiveStore(store._id)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-semibold text-gray-600">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{store.name}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3 mt-2">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-indigo-50 to-violet-50/50 text-indigo-700 shadow-xs"
                  : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-900"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500" />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — Storefront link + AI Badge */}
      <div className="space-y-2 border-t border-gray-100 p-3">
        {activeStore && (
          <a
            href={`/store/${activeStore.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="flex items-center gap-2">
              <Store className="h-3.5 w-3.5" />
              View storefront
            </span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <div className="relative overflow-hidden rounded-xl border border-indigo-200/40 bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 p-3">
          <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-violet-200/40 blur-2xl" />
          <div className="relative flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs">
              <Sparkles className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-indigo-900">AI Powered</p>
              <p className="truncate text-[10px] text-indigo-700/70">Smart tools enabled</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
