import React from "react";

import { parseMarkdown } from "../../src/util/parseMarkdown";

import FlexCenter from "../flex-center";

import styles from "./styles.module.css";

export interface SourceInfo {
  title: string;
  byline: string;
  overview?: string;
  website: string | null;
  showDatasets: boolean;
  showNarratives: boolean;
  avatar: string;
}

export default function SourceInfoHeading({
  sourceInfo,
}: {
  sourceInfo: SourceInfo;
}): React.ReactElement {
  return (
    <>
      <FlexCenter>
        <Title avatarSrc={sourceInfo.avatar}>
          {sourceInfo.title}
          <Byline>{sourceInfo.byline}</Byline>
          {sourceInfo.website && (
            <div style={{ fontSize: "18px" }}>
              <a className={styles.styledLink} href={sourceInfo.website}>
                {sourceInfo.website.replace(/(^\w+:|^)\/\//, "")}
              </a>
            </div>
          )}
        </Title>
      </FlexCenter>
      {sourceInfo.overview && (
        <FlexCenter>
          <div className={styles.overviewContainer}>
            <MarkdownDisplay mdstring={sourceInfo.overview} />
          </div>
        </FlexCenter>
      )}
    </>
  );
}

function Byline({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement | null {
  return children ? <div className={styles.byline}>{children}</div> : null;
}

function MarkdownDisplay({
  mdstring,
}: {
  mdstring: string;
}): React.ReactElement {
  let cleanDescription: string;

  try {
    cleanDescription = parseMarkdown(mdstring);
  } catch (err) {
    console.error(`Error parsing markdown: ${err}`);
    cleanDescription = "<p>There was an error parsing markdown content.</p>";
  }

  return <div dangerouslySetInnerHTML={{ __html: cleanDescription }} />;
}

function Title({
  avatarSrc,
  children,
}: {
  avatarSrc: string;
  children: React.ReactNode;
}): React.ReactElement | null {
  if (!children) return null;

  return (
    <div className={styles.titleWrapper}>
      {avatarSrc ? (
        <img className={styles.avatarImg} alt="avatar" src={avatarSrc} />
      ) : null}
      <div className={styles.title}>{children}</div>
    </div>
  );
}
