/**
 * Page copied from https://github.com/vercel/next.js/blob/canary/examples/with-styled-components/pages/_document.tsx
 * with modifications. See also 
 * <https://nextjs.org/docs/pages/building-your-application/routing/custom-document>
 */

import type { DocumentContext, DocumentInitialProps } from "next/document";
import Document from "next/document";
import { ServerStyleSheet } from "styled-components";
import { Html, Head, Main, NextScript} from "next/document";

export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      // Run the React rendering logic synchronously
      ctx.renderPage = () =>
        originalRenderPage({
          // Useful for wrapping the whole react tree
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      // Run the parent `getInitialProps`, it now includes the custom `renderPage`
      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }

  /** The following was our previous _document rendering, which I presume is identical from that within the parent `Document` class,
   * as we can leave it out and the result seems the same. TO CHECK.
   */
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
