import type { AppProps } from "next/app";
import { Lato } from 'next/font/google'
import Script from 'next/script'
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import "../src/styles/browserCompatability.css";
import "../src/styles/bootstrap.css";
import "../src/styles/globals.css";

// Custom fonts bundled (i.e. no external requests), see <https://nextjs.org/docs/pages/building-your-application/optimizing/fonts>
const lato = Lato({
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--lato',
})


export default function App({ Component, pageProps }: AppProps) {
  const [ queryClient ] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <div className={lato.variable}>
        <PlausibleAnalytics/>
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
}

function PlausibleAnalytics() {
  /* See <https://plausible.io/docs/plausible-script>. Analytics are disabled on
     localhost, but use `script.local.js` if you want to track localhost for
     testing purposes */
  return (
    <Script
      src="https://plausible.io/js/script.js"
      data-domain="nextstrain.org"
      async
      defer
    />
  )
}
