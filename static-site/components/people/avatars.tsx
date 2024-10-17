import React from "react";

import styles from "./avatars.module.css";
import { TeamMember, teamMembers } from "./teamMembers";

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

export function TeamPageList({
  membersKey,
}: {
  membersKey: string;
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

function Comma(): React.ReactElement {
  return <span style={{ marginLeft: "2px", marginRight: "2px" }}>,</span>;
}

function MaybeLinked({
  link,
  children,
}: {
  link: string | undefined;
  children: React.ReactNode;
}) {
  return link ? <a href={link}>{children}</a> : children;
}
