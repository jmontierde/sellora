"use client";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  BarChart3,
  Store,
  Zap,
  Shield,
  Bot,
  ArrowRight,
  Check,
  Star,
  TrendingUp,
  Layers,
  CreditCard,
} from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Multi-Store System",
    description: "Create and manage multiple storefronts from one unified dashboard.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: Sparkles,
    title: "AI Product Descriptions",
    description: "Generate compelling, SEO-friendly copy for every product instantly.",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: Bot,
    title: "AI Chatbot",
    description: "Always-on assistant that answers buyer questions in real-time.",
    color: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Track revenue, conversion, and customer behavior at a glance.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "Real-Time Sync",
    description: "Inventory and orders update instantly across every device.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Stripe-powered checkout with PCI-grade encryption built-in.",
    color: "from-blue-500 to-sky-500",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Everything you need to launch",
    features: ["1 Store", "10 Products", "Basic Analytics", "AI Chatbot"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "29",
    description: "For growing businesses",
    features: [
      "5 Stores",
      "100 Products / store",
      "Advanced Analytics",
      "AI Product Descriptions",
      "Priority Support",
      "Custom Themes",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "99",
    description: "For large-scale operations",
    features: [
      "50 Stores",
      "10,000 Products / store",
      "Full Analytics Suite",
      "All AI Features",
      "API Access",
      "Dedicated Support",
      "White-label",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const stats = [
  { label: "Active Stores", value: "12K+" },
  { label: "Products Sold", value: "1.2M" },
  { label: "AI Descriptions", value: "850K" },
  { label: "Uptime", value: "99.99%" },
];

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Background — gradient mesh + grid */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/30 to-white" />
          <div className="absolute inset-0 bg-grid bg-grid-mask opacity-60" />
          <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-3xl animate-float-slow" />
          <div className="absolute -top-24 right-1/4 h-[420px] w-[420px] rounded-full bg-fuchsia-200/40 blur-3xl animate-float-slow [animation-delay:2s]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-indigo-200/60 bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700 shadow-xs backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </span>
              Now with AI-powered product copy
              <ArrowRight className="h-3 w-3" />
            </div>

            <h1 className="mt-7 animate-fade-up text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl [animation-delay:80ms]">
              Build a beautiful store{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent animate-gradient">
                  powered by AI
                </span>
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl animate-fade-up text-balance text-lg leading-relaxed text-gray-600 [animation-delay:160ms]">
              Sellora gives you everything to launch and grow online —
              AI copywriting, smart chatbots, real-time analytics, and a
              storefront that converts.
            </p>

            <div className="mt-10 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:240ms]">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="xl" className="gap-2 px-8">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <Button size="xl" className="gap-2 px-8">
                    Start selling free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </SignInButton>
              )}
              <Link href="#features">
                <Button variant="outline" size="xl" className="gap-2">
                  See features
                </Button>
              </Link>
            </div>

            <p className="mt-6 animate-fade-up text-xs text-gray-500 [animation-delay:320ms]">
              No credit card required · 1 store free forever
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mx-auto mt-20 max-w-5xl animate-fade-up [animation-delay:400ms]">
            <div className="absolute -inset-x-8 -inset-y-8 rounded-[32px] bg-gradient-to-b from-indigo-200/40 via-violet-200/30 to-transparent blur-2xl" />
            <div className="relative rounded-2xl border border-gray-200/60 bg-white/60 p-2 shadow-2xl shadow-indigo-500/10 backdrop-blur">
              <div className="overflow-hidden rounded-xl bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 p-6 sm:p-8">
                <div className="flex items-center gap-1.5 mb-6">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <div className="ml-3 text-[11px] text-white/40">app.sellora.com / dashboard</div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { label: "Total Revenue", value: "$12,450", trend: "+12.5%", color: "emerald" },
                    { label: "Orders", value: "156", trend: "+8.2%", color: "indigo" },
                    { label: "Active Products", value: "48", trend: "3 low", color: "amber" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
                    >
                      <p className="text-xs text-white/50">{stat.label}</p>
                      <p className="mt-1 text-2xl font-semibold text-white tracking-tight">{stat.value}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs">
                        <TrendingUp className={`h-3 w-3 text-${stat.color}-400`} />
                        <span className={`text-${stat.color}-400`}>{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Chart placeholder */}
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-end gap-2 h-32">
                    {[35, 55, 42, 68, 50, 85, 72, 95, 80, 110, 95, 130].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-indigo-600 to-fuchsia-400"
                        style={{ height: `${h}%`, opacity: 0.4 + i * 0.05 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-y border-gray-100 bg-gray-50/50">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-semibold tracking-tight text-gray-900">{s.value}</p>
                <p className="mt-1 text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="default" className="mb-4">
              <Layers className="h-3 w-3" />
              Features
            </Badge>
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Everything you need to sell
            </h2>
            <p className="mt-4 text-balance text-lg leading-relaxed text-gray-600">
              A complete e-commerce platform with AI superpowers, built for modern teams.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-md`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-tight text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Section ─── */}
      <section id="ai" className="relative overflow-hidden bg-gray-950 py-24 text-white sm:py-32">
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-32 left-10 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute -bottom-32 right-10 h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-violet-200 backdrop-blur">
                <Sparkles className="h-3 w-3" />
                AI Features
              </div>
              <h2 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Your AI co-pilot for{" "}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  e-commerce
                </span>
              </h2>
              <p className="mt-4 text-balance text-lg leading-relaxed text-gray-300">
                Let AI handle the heavy lifting. From writing product descriptions to
                answering customer questions — Sellora&apos;s AI helps you sell more.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  "Generate product descriptions in one click",
                  "Smart chatbot trained on your catalog",
                  "AI-powered product recommendations",
                  "Intelligent search that understands intent",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <span className="text-sm text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Chat preview card */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 blur-2xl" />
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl">
                <div className="rounded-xl bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">AI Assistant</p>
                      <p className="text-[11px] text-gray-500">Online · Trained on your catalog</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-md bg-indigo-600 px-4 py-2.5 text-sm text-white">
                      Tell me about the Wireless Pro Headphones
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-gray-100 px-4 py-2.5 text-sm text-gray-800">
                      The Wireless Pro Headphones feature 40mm drivers, active noise
                      cancellation, 30-hour battery, and Bluetooth 5.3. Currently $149.99
                      <span className="text-emerald-600 font-medium"> (20% off)</span>.
                    </div>
                    <div className="flex items-center gap-1 pl-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse-soft" />
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse-soft [animation-delay:200ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse-soft [animation-delay:400ms]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="default" className="mb-4">
              <CreditCard className="h-3 w-3" />
              Pricing
            </Badge>
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-balance text-lg leading-relaxed text-gray-600">
              Start free, upgrade as you grow. No hidden fees.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-indigo-500/30 bg-gradient-to-b from-indigo-50/40 to-white shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/10"
                    : "border border-gray-200/80 bg-white hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-medium text-white shadow-sm">
                      <Star className="h-3 w-3 fill-white" />
                      Most popular
                    </div>
                  </div>
                )}

                <h3 className="text-base font-semibold tracking-tight text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-gray-500">$</span>
                  <span className="text-5xl font-semibold tracking-tight text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 shrink-0 mt-0.5 text-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {isSignedIn ? (
                    <Link href="/dashboard" className="w-full">
                      <Button
                        className="w-full"
                        size="lg"
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <SignInButton mode="modal">
                      <Button
                        className="w-full"
                        size="lg"
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </SignInButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay">
              <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Ready to launch your store?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-balance text-base leading-relaxed text-indigo-100">
                Join thousands of merchants building their business with Sellora.
                Free to start, scale as you grow.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button size="xl" variant="glass" className="gap-2 bg-white !text-indigo-700 hover:bg-white/90">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <Button size="xl" variant="glass" className="gap-2 bg-white !text-indigo-700 hover:bg-white/90">
                      Start free today
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Image
              src="/sellora-logo.png"
              alt="Sellora"
              width={677}
              height={369}
              className="h-15 w-auto"
            />
            <p className="text-sm text-gray-500">
              AI-powered e-commerce for everyone
            </p>
            <p className="text-sm text-gray-400">© 2026 Sellora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
