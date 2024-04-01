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
  ]
};

export default withYaml(nextConfig);
