"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useStoreState } from "@/hooks/use-store";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const getOrCreate = useMutation(api.users.getOrCreate);
  const currentUser = useQuery(api.users.getCurrent, {
    clerkId: user?.id ?? "",
  });
  const stores = useQuery(
    api.stores.getByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const { activeStoreId, setActiveStore } = useStoreState();

  useEffect(() => {
    if (user && isLoaded) {
      getOrCreate({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        name: user.fullName ?? user.firstName ?? "User",
        imageUrl: user.imageUrl,
      });
    }
  }, [user, isLoaded, getOrCreate]);

  useEffect(() => {
    if (stores && stores.length > 0 && !activeStoreId) {
      setActiveStore(stores[0]._id);
    }
  }, [stores, activeStoreId, setActiveStore]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen bg-gray-50/80">
      {/* Subtle background pattern */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-indigo-100/30 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-100/20 blur-3xl" />
      </div>

      <DashboardSidebar />
      <div className="relative z-10 flex flex-1 flex-col pl-64">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
