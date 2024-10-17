import type { Metadata } from "next";
import React from "react";

import { BigSpacer } from "../../components/spacers";
import FlexCenter from "../../components/flex-center";
import { FocusParagraphNarrow } from "../../components/focus-paragraph";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage(): React.ReactElement {
  return (
    <>
      <BigSpacer count={4} />

      <h1>Contact Us</h1>

      <FlexCenter>
        <FocusParagraphNarrow>
          We are a small team, but connecting with users is important to us.
          <br />
          <br />
          If you have a general question about Nextstrain, we encourage you to
          post on our{" "}
          <a
            href="https://discussion.nextstrain.org"
            target="_blank"
            rel="noreferrer noopener"
          >
            discussion forum
          </a>
          , where both Nextstrain team members and other community members can
          assist you.
          <br />
          <br />
          To send a bug report or feature request, please open an issue in one
          of our{" "}
          <a href="https://github.com/orgs/nextstrain/repositories">
            GitHub repositories
          </a>
          .
          <br />
          <br />
          For private inquiries, you can reach us at hello
          <span style={{ display: "none" }}>obfuscate</span>@nextstrain.org.
          <br />
          <br />
          We also host office hours via Zoom every week on Thursdays at 10AM US
          Pacific time. Email us for the meeting link.
        </FocusParagraphNarrow>
      </FlexCenter>

      <BigSpacer />
    </>
  );
}
