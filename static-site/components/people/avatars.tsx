import React from "react";

import styles from "./avatars.module.css";
import { TeamMember, teamMembers } from "./teamMembers";

/**
 * React Server Component to render the list of small avatars of team
 * members in the footer.
 */
export function FooterTeamList(): React.ReactElement {
  const people = [...teamMembers["founders"], ...teamMembers["core"]];

  return (
    <div className={styles.footerWrapper}>
      {people.map(
        (person: TeamMember, i: number): React.ReactElement => (
          <div key={person.name}>
            <MaybeLinked link={person.link}>
              <img
                alt={person.name}
                src={require("../../static/team/" + person.image).default.src}
              />
              <span style={{ whiteSpace: "nowrap" }}>{person.name}</span>
            </MaybeLinked>
            {i + 1 !== people.length && <Comma />}
          </div>
        ),
      )}
    </div>
  );
}

/** React Server Component to render the team listing on the /team page */
export function TeamPageList({
  membersKey,
}: {
  /** which set of team members we want to render */
  membersKey: keyof typeof teamMembers;
}): React.ReactElement {
  const people: TeamMember[] = teamMembers[membersKey];

  return (
    <div className={styles.teamPageWrapper}>
      {people.map(
        (person: TeamMember): React.ReactElement => (
          <div
            className={styles.sideways}
            key={person.name}
            style={{ alignItems: person.blurb ? "top" : "center" }}
          >
            <MaybeLinked link={person.link}>
              <img
                alt={person.name}
                src={require("../../static/team/" + person.image).default.src}
              />
            </MaybeLinked>
            <div className={styles.updown}>
              <MaybeLinked link={person.link}>
                <span style={{ whiteSpace: "nowrap" }}>{person.name}</span>
              </MaybeLinked>
              {person.blurb && (
                <div className={styles.blurb}>{person.blurb}</div>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

/** React Server Component to render a particularly styled comma */
function Comma(): React.ReactElement {
  return <span style={{ marginLeft: "2px", marginRight: "2px" }}>,</span>;
}

/**
 * React Server Component to conditionally put an <a href> around a
 * set of children, if one is provided.
 */
function MaybeLinked({
  link,
  children,
}: {
  /** the link to use, or undefined to not add a link */
  link: string | undefined;

  /** the children to display, with or without associated link */
  children: React.ReactNode;
}) {
  return link ? <a href={link}>{children}</a> : children;
}
