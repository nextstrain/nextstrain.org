export type Entry = {
  name: string;
  href: string;
};

export type Section = {
  title: string;
  entries: Entry[];
};

export const sections: Section[] = [
  {
    title: "Resources",
    entries: [
      { name: "Core pathogens", href: "/pathogens" },
      { name: "SARS-CoV-2", href: "/sars-cov-2" },
      { name: "Community", href: "/community" },
      { name: "Groups", href: "/groups" },
    ],
  },
  {
    title: "Tools",
    entries: [
      { name: "Nextclade", href: "https://clades.nextstrain.org/" },
      { name: "Auspice.us", href: "https://auspice.us/" },
      { name: "Augur", href: "https://docs.nextstrain.org/projects/augur" },
      { name: "Auspice", href: "https://docs.nextstrain.org/projects/auspice" },
      {
        name: "Nextstrain CLI",
        href: "https://docs.nextstrain.org/projects/cli",
      },
    ],
  },
  {
    title: "Support",
    entries: [
      { name: "Documentation", href: "https://docs.nextstrain.org/" },
      { name: "Discussion forum", href: "https://discussion.nextstrain.org/" },
    ],
  },
  {
    title: "About",
    entries: [
      { name: "Team", href: "/team" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
  },
];
