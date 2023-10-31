import React from "react";
import { IconParagraph } from "../src/components/splash/styles";

export const siteTitle = "Nextstrain @ Contoso";

// Alternative site title for SEO.
export const siteTitleAlt = "Real-time tracking of pathogen evolution";

// Logo used for SEO
export const siteLogo = "/static/logos/nextstrain-logo-small.png";

export const siteUrl = "https://nextstrain.org";

// Website description used for RSS feeds/meta description tag.
export const siteDescription = "Real-time tracking of pathogen evolution";

export const groupsApp = true;

export const groupsTitle = "Contoso Nextstrain Groups Server";

export const ErrorBannerInitialMessage = () => (<>
  Please <a href="mailto:support@contoso.com">contact us at support@contoso.com</a> if you believe this to be an error.
</>);

export const DataFetchError = () => (<>
  Something went wrong getting data.
  Please <a href="mailto:support@contoso.com">contact us at support@contoso.com</a> if this continues to happen.
</>);

export const GroupsAbstract = () => (<>
    This is Contoso Corporation's internal Nextstrain Groups Server.
    <br />
    <br />
    For more details about Nextstrain Groups,
    <a href="https://docs.contoso.com/nextstrain-groups"> please see our documentation</a>.
    <br />
    <br />
    Nextstrain Groups is still in the early stages and require a service administrator to set up and add users.
    Please <a href="mailto:support@contoso.com">contact us at support@contoso.com</a> and we’d be happy to set up a group for you.
</>);

export const Footer = () => (<>
  <IconParagraph>
    {"Hadfield "}<i>{"et al., "}</i>
    <a href="https://doi.org/10.1093/bioinformatics/bty407" target="_blank" rel="noreferrer noopener">Nextstrain: real-time tracking of pathogen evolution</a>
    <i>, Bioinformatics</i> (2018)
    <div style={{ margin: "10px 0px" }} />
    Developed by the Nextstrain team and hosted by Contoso.
  </IconParagraph>
</>);
