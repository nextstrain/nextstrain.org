import { Lato } from 'next/font/google'
import Script from 'next/script'
import { siteTitle, siteDescription } from '../data/BaseConfig';

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

export const metadata = {
  title: siteTitle,
  description: siteDescription,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={lato.className}>
      <PlausibleAnalytics/>
      <body>{children}</body>
    </html>
  )
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
