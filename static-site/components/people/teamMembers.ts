export type TeamMember = {
  name: string;
  image: string;
  link?: string;
  blurb?: string;
};

export const teamMembers: {
  founders: TeamMember[];
  core: TeamMember[];
  alumni: TeamMember[];
  board: TeamMember[];
} = {
  founders: [
    {
      name: "Trevor Bedford",
      image: "trevor-bedford.jpg",
      link: "https://bedford.io/team/trevor-bedford/",
      blurb:
        "Trevor and Richard coded first version of Nextflu in early 2015. Subsequently, Trevor has helped to guide development of software to endemic and emerging pathogens with a focus on UX and scientific impact.",
    },
    {
      name: "Richard Neher",
      image: "richard-neher.jpg",
      link: "https://neherlab.org/richard-neher.html",
      blurb:
        "Richard and Trevor coded first version of Nextflu in early 2015. Richard has focussed on the methods and algorithms in Nextstrain's analyses and more recently on Nextclade.",
    },
  ],
  core: [
    {
      name: "Ivan Aksamentov",
      image: "ivan-aksamentov.jpg",
      link: "https://neherlab.org/ivan-aksamentov.html",
      blurb:
        "Ivan joined the team in 2020 and focuses on Nextclade and some of the algorithms in Nextstrain's underlying tools.",
    },
    {
      name: "Kim Andrews",
      image: "kim-andrews.jpg",
      link: "https://bedford.io/team/kim-andrews/",
      blurb:
        "Kim joined the team in 2023 with a background in ecological and evolutionary genomics, and focuses on pathogen workflows.",
    },
    {
      name: "Jennifer Chang",
      image: "jennifer-chang.jpg",
      link: "https://bedford.io/team/jennifer-chang/",
      blurb:
        "Jennifer joined the team in 2021 and specializes in Terra and Nextflow workflows and contributes to various pathogen workflows as needed.",
    },
    {
      name: "James Hadfield",
      image: "james-hadfield.jpg",
      link: "https://bedford.io/team/james-hadfield/",
      blurb:
        "James joined the team in 2017 after his PhD and works on all aspects of Nextstrain with a particular focus on interactive visualisation.",
    },
    {
      name: "Emma Hodcroft",
      image: "emma-hodcroft.jpg",
      link: "http://emmahodcroft.com/",
      blurb:
        "Emma joined Nextstrain in 2017 and has worked on the pipeline and visualization, including extending Nextstrain to use VCF files, but now mostly focuses on Enteroviruses and SARS-CoV-2.",
    },
    {
      name: "John Huddleston",
      image: "john-huddleston.jpg",
      link: "https://bedford.io/team/john-huddleston/",
      blurb:
        "John works on Nextstrain's bioinformatics tools like Augur and pathogen workflows like seasonal influenza and SARS-CoV-2.",
    },
    {
      name: "Jover Lee",
      image: "jover-lee.jpg",
      link: "https://bedford.io/team/jover-lee/",
      blurb:
        "Jover works on all aspects of Nextstrain with a particular focus on data pipelines and visualizations.",
    },
    {
      name: "Victor Lin",
      image: "victor-lin.png",
      link: "https://bedford.io/team/victor-lin/",
      blurb:
        "Victor joined the team in 2021 and works on all aspects of Nextstrain with a particular focus on tooling (e.g. Augur, runtimes) and documentation.",
    },
    {
      name: "Cornelius Roemer",
      image: "cornelius-roemer.jpg",
      link: "https://neherlab.org/cornelius-roemer.html",
      blurb:
        "Cornelius joined the team in 2021 and focuses on Nextclade and SARS-CoV-2.",
    },
  ],
  alumni: [
    {
      name: "John SJ Anderson",
      image: "john-sj-anderson.jpg",
      link: "https://bedford.io/team/john-sj-anderson/",
      blurb:
        "John was part the team 2024-2025 and worked on all aspects of Nextstrain.",
    },
    {
      name: "Sidney Bell",
      image: "sidney-bell.jpg",
      link: "https://bedford.io/team/sidney-bell/",
    },
    {
      name: "Allison Black",
      image: "allison-black.jpg",
      link: "https://bedford.io/team/allison-black/",
    },
    {
      name: "Charlton Callender",
      image: "charlton-callender.jpg",
      link: "https://bedford.io/team/charlton-callender/",
    },
    {
      name: "Kairsten Fay",
      image: "kairsten-fay.jpg",
      link: "https://bedford.io/team/kairsten-fay/",
    },
    {
      name: "Eli Harkins",
      image: "eli-harkins.jpg",
      link: "https://bedford.io/team/eli-harkins/",
    },
    {
      name: "Misja Ilcisin",
      image: "misja-ilcisin.jpg",
      link: "https://bedford.io/team/misja-ilcisin/",
    },
    {
      name: "Colin Megill",
      image: "colin-megill.jpg",
      link: "https://www.colinmegill.com/",
    },
    {
      name: "Louise Moncla",
      image: "louise-moncla.jpg",
      link: "https://bedford.io/team/louise-moncla/",
    },
    {
      name: "Miguel Parades",
      image: "miguel-parades.jpg",
      link: "https://bedford.io/team/miguel-parades/",
    },
    {
      name: "Barney Potter",
      image: "barney-potter.jpg",
      link: "https://bedford.io/team/barney-potter/",
    },
    {
      name: "Pavel Sagulenko",
      image: "pavel-sagulenko.jpg",
      link: "https://neherlab.org/pavel-sagulenko.html",
    },
    {
      name: "Thomas Sibley",
      image: "thomas-sibley.jpg",
      link: "https://bedford.io/team/thomas-sibley/",
      blurb:
        "Thomas was part of the team from 2018–2025 and worked on all aspects of Nextstrain with a particular focus on reducing barriers to usage via better infrastructure (e.g. nextstrain.org, Groups), tooling (e.g. CLI, runtimes), and documentation.",
    },
    {
      name: "Cassia Wagner",
      image: "cassia-wagner.jpg",
      link: "https://bedford.io/team/cassia-wagner/",
    },
    {
      name: "Moira Zuber",
      image: "moira-zuber.jpg",
      blurb:
        "Moira was key in running the regular SARS-CoV-2 builds during the early-mid pandemic, and implementing key data-cleaning scripts to standardize incoming sequences.",
    },
  ],
  board: [
    {
      name: "Vítor Borges (chair)",
      image: "vitor-borges.jpg",
      link: "https://orcid.org/0000-0003-3767-2209",
      blurb:
        "Researcher, National Institute of Health Dr Ricardo Jorge, Portugal",
    },
    {
      name: "Sarah Cobey",
      image: "sarah-cobey.jpg",
      link: "https://cobeylab.uchicago.edu/",
      blurb:
        "Professor, Department of Ecology and Evolution, University of Chicago, USA",
    },
    {
      name: "Peter van Heusden",
      image: "peter-van-heusden.jpg",
      link: "https://orcid.org/0000-0001-6553-5274",
      blurb:
        "Researcher, South African National Bioinformatics Institute, South Africa",
    },
    {
      name: "Zamin Iqbal",
      image: "zamin-iqbal.png",
      blurb: "Professor, Milner Centre for Evolution, University of Bath, UK",
    },
    {
      name: "Nicola Lewis",
      image: "nicola-lewis.jpg",
      link: "https://www.crick.ac.uk/research/find-a-researcher/nicola-lewis",
      blurb:
        "Director, Worldwide Influenza Centre, The Francis Crick Institute, UK",
    },
    {
      name: "Nídia Trovão",
      image: "nidia-trovao.jpg",
      link: "https://www.fic.nih.gov/About/Staff/epidemiology-population-studies/Pages/Genomic-Epidemiology-and-Evolution-of-Pathogens-.aspx",
      blurb:
        "Section Leader, Fogarty International Center, National Institutes of Health, USA",
    },
  ],
};
