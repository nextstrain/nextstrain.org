/**
 * TODO: remove this file once the Next.js bug¹ is fixed.
 *
 * Context:
 * 1. The /whoami route serves both HTML (from Next.js) and JSON (from server).
 * 2. For static pages, Next.js adds a default permissive Cache-Control header.
 *
 * These two behaviors are typically fine, but a Next.js bug¹ drops the Vary
 * header set by contentTypesProvided() that instructs shared (CDN) caches to
 * NOT serve cached HTML to JSON requests.
 *
 * We work around this by sending a restrictive Cache-Control header (global
 * default early in Express handling). This only applies to dynamic pages, so we
 * must force /whoami to be a dynamic page. force-dynamic doesn't apply to
 * whoami/page.tsx because it is a client component, so we add it to this server
 * component.
 *
 * ¹ <https://github.com/vercel/next.js/issues/85999>
 */
import React from 'react';

export const dynamic = 'force-dynamic';

// No-op for HTML
export default function WhoAmILayout({ children }: { children: React.ReactNode }) {
  return children;
}
