import withYaml from 'next-plugin-yaml';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    /* Disable Next.js's image optimization API (/_next/image).  It has had a
     * string of serious vulnerabilities, including remote code execution
     * advisories with no fix in Next.js 14.x (e.g. GHSA-2xp9-vwfh-vxw4,
     * GHSA-2464-fhr4-w9xw).
     */
    unoptimized: true,
  },
  async headers() {
    return [
      /* TODO: remove this once the Next.js bug¹ is fixed.
       *
       * Context:
       * 1. The /whoami route serves both HTML (from Next.js) and JSON (from server).
       * 2. For static pages, Next.js adds a default permissive Cache-Control header.
       *
       * These two behaviors are typically fine, but a Next.js bug¹ drops the Vary
       * header set by contentTypesProvided() that instructs shared (CDN) caches to
       * NOT serve cached HTML to JSON requests.
       *
       * We work around this by sending a restrictive Cache-Control header.
       *
       * ¹ <https://github.com/vercel/next.js/issues/85999>
       */
      {
        source: '/whoami',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache' },
        ],
      },
    ];
  },
  transpilePackages: [
    'react-virtualized'
  ],
  eslint: {
    // Allow builds to complete regardless of linting results. This is ok since
    // linting is done explicitly in CI.
    ignoreDuringBuilds: true
  }
};

export default withYaml(nextConfig);
