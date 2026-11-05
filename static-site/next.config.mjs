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
