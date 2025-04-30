import Script from "next/script";
import React from "react";

// import from BaseConfig to avoid a conflict with SiteConfig, due to
// it importing an older component that's still using styled.
//
// TODO convert over to SiteConfig once this is no longer true.
import {
  plausibleAnalyticsDataDomain,
  plausibleAnalyticsScript,
} from "../../data/BaseConfig";

/** React Server Component to add analytics javascript */
export default function PlausibleAnalytics(): React.ReactElement {
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
