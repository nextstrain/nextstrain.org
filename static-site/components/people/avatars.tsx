import { ReactElement, ReactNode } from "react";

import styles from "./avatars.module.scss";
import { TeamMember, teamMembers } from "./teamMembers";

export function FooterTeamList(): ReactElement {
  const people = [...teamMembers["founders"], ...teamMembers["core"]];

  return (
    <div className={styles.footerWrapper}>
      {people.map(
        (person: TeamMember, i: number): ReactElement => (
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

function MaybeLinked({
  link,
  children,
}: {
  link: string | undefined;
  children: ReactNode;
}) {
  return link ? <a href={link}>{children}</a> : children;
}

function Comma(): ReactElement {
  return <span style={{ marginLeft: "2px", marginRight: "2px" }}>,</span>;
}

