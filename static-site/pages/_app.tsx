import type { AppProps } from "next/app";
import { Lato } from 'next/font/google'

import "../src/styles/browserCompatability.css";
import "../src/styles/bootstrap.css";
import "../src/styles/globals.css";

// Custom fonts bundled (i.e. no external requests), see <https://nextjs.org/docs/pages/building-your-application/optimizing/fonts>
const lato = Lato({
  weight: ['100', '300', '400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--lato',
})


export default function App({ Component, pageProps }: AppProps) {
  return <div className={lato.variable}>
    <Component {...pageProps} />
  </div>
}
