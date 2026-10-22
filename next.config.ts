import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SEO-first static dataset: pages await params/searchParams outside Suspense
  // so unlisted dynamic params block and `notFound()` emits a real HTTP 404
  // ("fallback: blocking" ISR style). Partial Prefetching must be off for that.
  cacheComponents: true,
  partialPrefetching: false,
  // Scale static-generation workers to available RAM so builds also run on
  // low-memory laptops without native OOM crashes.
  experimental: {
    memoryBasedWorkersCount: true,
  },
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
