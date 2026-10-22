import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SEO-first static dataset: pages await params/searchParams outside Suspense
  // so unlisted dynamic params block and `notFound()` emits a real HTTP 404
  // ("fallback: blocking" ISR style). Partial Prefetching must be off for that.
  cacheComponents: true,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
