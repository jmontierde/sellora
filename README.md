# Sellora

Sellora is an AI-powered multi-store ecommerce platform built with Next.js, Clerk, and Convex.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure your environment variables (Clerk, Convex, AI provider keys).

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

## How to Access Your Created Store

After you create a store from the dashboard, you can access it in two ways:

- From the dashboard, click **View Store**.
- Or open the public store URL directly:
  - `http://localhost:3000/store/<your-store-slug>`

Example: if your store name is `My Awesome Store`, the slug becomes `my-awesome-store`, and your URL is:

- `http://localhost:3000/store/my-awesome-store`

## Store Flow (End to End)

1. Sign in from the landing page.
2. Go to `/dashboard` (protected route).
3. Create your store using **Create Store**.
4. The app creates a slug from your store name (for example, `My Store` -> `my-store`).
5. Open your storefront at `/store/<slug>`.
6. Customers browse products, open product details, add items to cart, and checkout.
7. You manage products, orders, and analytics from dashboard pages.

## Main Routes

- `/` - Landing page
- `/dashboard` - Main seller dashboard
- `/dashboard/products` - Product management
- `/dashboard/orders` - Order management
- `/dashboard/analytics` - Sales and performance metrics
- `/store/[slug]` - Public storefront
- `/store/[slug]/product/[productId]` - Product detail
- `/store/[slug]/cart` - Customer cart
- `/store/[slug]/checkout` - Checkout

## Tech Stack

- Next.js (App Router)
- Clerk (Authentication)
- Convex (Backend + real-time data)
- Tailwind CSS + custom UI components

## Notes

- Only dashboard routes are protected by auth middleware.
- Storefront routes are public by design so customers can visit your store link directly.
