import type { AppProps } from "next/app";
import { Lato } from 'next/font/google'
import Script from 'next/script'

import { plausibleAnalyticsDataDomain, plausibleAnalyticsScript } from "../data/SiteConfig";
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
  return <div className={lato.variable}>
    <PlausibleAnalytics/>
    <Component {...pageProps} />
  </div>
}

function PlausibleAnalytics() {
  /* See <https://plausible.io/docs/plausible-script>. Analytics are
     disabled on localhost; see comments in BaseConfig if you want to
     change configuration, enable analytics for localhost, or disable
     them completely. */
  if (plausibleAnalyticsDataDomain && plausibleAnalyticsScript) {
    return (
      <Script
        src={plausibleAnalyticsScript}
        data-domain={plausibleAnalyticsDataDomain}
        async
        defer
      />
    );
  } else {
    return <></>;
  }
}
