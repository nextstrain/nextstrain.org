import React from "react";
import Link from 'next/link'
import NextstrainFooter from "../src/components/Footer";

export const siteTitle = "Nextstrain";

// Alternative site title for SEO.
export const siteTitleAlt = "Real-time tracking of pathogen evolution";

// Logo used for SEO
export const siteLogo = "/static/logos/nextstrain-logo-small.png";

export const siteUrl = "https://nextstrain.org";

// Website description used for RSS feeds/meta description tag.
export const siteDescription = "Real-time tracking of pathogen evolution";

export const groupsApp = false;

export const groupsTitle = "Scalable Sharing with Nextstrain Groups";

export const ErrorBannerInitialMessage = () => (<>
  Please <Link href="/contact">contact us</Link> if you believe this to be an error.
</>);

export const DataFetchError = () => (<>
  Something went wrong getting data.
  Please <Link href="/contact">contact us</Link> if this continues to happen.
</>);

export const GroupsAbstract = () => (<>
  We want to enable research labs, public health entities
  and others to share their datasets and narratives through Nextstrain with
  complete control of their data and audience. Nextstrain Groups is more scalable
  than community builds in both data storage and viewing permissions. Datasets in
  a public group are accessible to the general public via nextstrain.org, while
  private group data are only visible to logged in users with permission to see
  the data. A single entity can manage both a public and a private group in order
  to share data with different audiences.
  <br />
  <br />
  For more details about Nextstrain Groups,
  <a href="https://docs.nextstrain.org/en/latest/learn/groups/index.html"> please see our documentation</a>.
  For an alternative approach to sharing data through nextstrain.org which leverages GitHub repositories, please see
  <Link href="/community"> Community data sharing</Link>.
  <br />
  <br />
  Nextstrain Groups is still in the early stages and require a Nextstrain team
  member to set up and add users.
  Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org</a> and we’d be happy to set up a group for you.
</>);

export const Footer = NextstrainFooter;
