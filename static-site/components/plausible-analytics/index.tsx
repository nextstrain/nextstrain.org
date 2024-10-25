import Script from "next/script";
import React from "react";

export default function PlausibleAnalytics(): React.ReactElement {
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
  );
}
