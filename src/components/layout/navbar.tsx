"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center">
          <Image
            src="/sellora-logo.png"
            alt="Sellora"
            width={500}
            height={500}
            priority
            className="h-15 w-auto transition-transform duration-200 group-hover:scale-[1.04]"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/#features"
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100/70 hover:text-gray-900"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100/70 hover:text-gray-900"
          >
            Pricing
          </Link>
          <Link
            href="/#ai"
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100/70 hover:text-gray-900"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            AI
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm">Get Started</Button>
              </SignInButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
