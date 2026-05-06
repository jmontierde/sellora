import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-client-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sellora - AI-Powered E-Commerce Platform",
  description:
    "Create and manage your online store with AI-powered tools. Multi-store SaaS e-commerce platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-gray-50">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
