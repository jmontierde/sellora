"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/70 bg-white/70 px-6 backdrop-blur-xl">
      <div className="flex max-w-md flex-1 items-center gap-4">
        <div className="group relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
          <input
            placeholder="Search products, orders, customers…"
            className="h-9 w-full rounded-lg border border-gray-200/70 bg-gray-50/80 pl-9 pr-14 text-sm text-gray-900 placeholder:text-gray-400 transition-[border-color,background] focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <kbd className="hidden items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-500 sm:inline-flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-4 w-4 text-gray-500" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
          </span>
        </Button>
        <div className="ml-1 h-6 w-px bg-gray-200" />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-2 ring-white shadow-xs",
            },
          }}
        />
      </div>
    </header>
  );
}
