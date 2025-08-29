import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

import { BigSpacer } from "../spacers";

import { sections, Entry, Section } from "./sitemap";

import styles from "./site-map.module.css";

/** A React Server Component that renders the site map in the page footer */
export default function SiteMap(): React.ReactElement {
  return (
    <div className={`${styles.siteMap} row`}>
      {sections.map((section: Section) => (
        <div
          className={`${styles.sectionWrapper} col-md-3 col-sm-6`}
          key={section.title}
        >
          <div className={styles.section}>
            <BigSpacer />
            <h3 className={styles.sectionTitleWrapper}>{section.title}</h3>
            <SectionList entries={section.entries} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A helper component that renders one section of the site map */
function SectionList({ entries }: { entries: Entry[] }): React.ReactElement {
  return (
    <ul className={styles.unstyled}>
      {entries.map((entry) => (
        <li key={entry.name}>
          <p className={styles.sectionEntry}>
            {entry.href.startsWith("http") ? (
              <a href={entry.href} rel="noopener noreferrer" target="_blank">
                {entry.name}{" "}
                <span className={styles.footerIcon}>
                  <FaExternalLinkAlt />
                </span>
              </a>
            ) : (
              <a href={entry.href}>{entry.name}</a>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
