import React from "react";

export * from "./BaseConfig";

export const ErrorBannerInitialMessage = () => (<>
  Please <a href="/contact">contact us</a> if you believe this to be an error.
</>);

export const DataFetchError = () => (<>
  Something went wrong getting data.
  Please <a href="/contact">contact us</a> if this continues to happen.
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
  <a href="/community"> Community data sharing</a>.
  <br />
  <br />
  Nextstrain Groups is still in the early stages and require a Nextstrain team
  member to set up and add users.
  Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org</a> and we’d be happy to set up a group for you.
</>);
