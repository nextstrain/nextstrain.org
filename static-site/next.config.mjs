import withYaml from 'next-plugin-yaml';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
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
