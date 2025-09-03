"use client";

import React, { useEffect, useState } from "react";

import { Tooltip } from "react-tooltip-v5";
import ScrollableAnchor from "../../vendored/react-scrollable-anchor/ScrollableAnchor";

import featuredAnalyses from "../../content/featured-analyses.yaml";

import bookOpenIcon from "../../static/logos/fa-book-open-solid.svg";
import circleInfoIcon from "../../static/logos/fa-circle-info-solid.svg";
import covidIcon from "../../static/logos/fa-virus-covid-solid.svg";
import nextcladeIcon from "../../static/logos/nextclade-logo.svg";
import nextstrainLogoSmall from "../../static/logos/nextstrain-logo-small.png";
import nextstrainLogoTiny from "../../static/logos/nextstrain-logo-tiny.png";
import screwdriverWrenchIcon from "../../static/logos/fa-screwdriver-wrench-solid.svg";
import usersIcon from "../../static/logos/fa-users-solid.svg";
import virusesIcon from "../../static/logos/fa-viruses-solid.svg";
import emptyPathogenImage from "../../static/pathogen_images/empty.png";

import Button from "../button";
import ExpandableTiles from "../expandable-tiles";
import type { GenericTileBase } from "../expandable-tiles/types";
import FlexCenter from "../flex-center";
import { FocusParagraph, FocusParagraphCentered } from "../focus-paragraph";
import { BigSpacer, HugeSpacer } from "../spacers";

import styles from "./styles.module.css";

/** The tiles used in the top section of the splash */
export interface SplashTile extends GenericTileBase {
  /** description of the dataset on the tile */
  description: string;
  /** url to the dataset on the tile */
  url: string;
}

/** width of an individual tile, in pixels */
const tileWidth = 220; // pixels
/** height of an individual tile, in pixels */
const tileHeight = 285; // pixels

/**
 * the ID of the tooltip element; in a var because it is used in two
 * different places
 */
const tooltipId = "featuredAnalysesTooltip";

/** A React Client component to render the "splash" section of the home page */
export default function Splash(): React.ReactElement {
  return (
    <div className={styles.container}>
      <BigSpacer />

      <Heading />

      <HugeSpacer />

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <Section
          id="about"
          imgSrc={circleInfoIcon.src}
          title="About us"
          abstract="An open-source project to harness the scientific and public health potential of pathogen genome data"
          link="https://docs.nextstrain.org/en/latest/learn/about.html"
        />

        <Section
          id="pathogens"
          imgSrc={virusesIcon.src}
          title="Core pathogens"
          abstract="Continually updated views of a range of pathogens maintained by the Nextstrain team"
          link="/pathogens"
        />

        <Section
          id="sars-cov-2"
          imgSrc={covidIcon.src}
          title="SARS-CoV-2"
          abstract="Up-to-date analyses and a range of resources for SARS-CoV-2, the virus responsible for COVID-19 disease"
          link="/sars-cov-2"
        />

        <Section
          id="tooling"
          imgSrc={screwdriverWrenchIcon.src}
          title="Open source tooling"
          abstract="Bioinformatic workflows, analysis tools and visualization apps for use by the community"
          link="https://docs.nextstrain.org/en/latest/install.html"
        />

        <Section
          id="nextclade"
          imgSrc={nextcladeIcon.src}
          title="Nextclade"
          abstract="In-browser phylogenetic placement, clade assignment, mutation calling and sequence quality checks"
          link="https://clades.nextstrain.org"
        />

        <Section
          id="groups"
          imgSrc={usersIcon.src}
          title="Nextstrain Groups"
          abstract="Datasets and narratives shared by research labs, public health entities and others"
          link="/groups"
        />
      </div>

      <h1 className={styles.H1}>Featured analyses</h1>

      <BigSpacer />
      <ExpandableTiles
        tiles={
          featuredAnalyses as SplashTile[] /* eslint-disable-line @typescript-eslint/consistent-type-assertions */
        }
        tileWidth={tileWidth}
        tileHeight={tileHeight}
        TileComponent={Tile}
      />
      <div style={{ position: "relative" }}>
        <Tooltip style={{ fontSize: "1.6rem" }} id={tooltipId} />
      </div>

      {/* PHILOSOPHY */}
      <ScrollableAnchor id="philosophy">
        <h1 className={styles.H1}>Philosophy</h1>
      </ScrollableAnchor>

      <div className="row">
        <div className="col-lg-6">
          <BigSpacer />

          <h2 className={styles.H2}>Pathogen Phylogenies</h2>

          <FocusParagraph>
            In the course of an infection and over an epidemic, pathogens
            naturally accumulate random mutations to their genomes. This is an
            inevitable consequence of error-prone genome replication. Since
            different genomes typically pick up different mutations, mutations
            can be used as a marker of transmission in which closely related
            genomes indicate closely related infections. By reconstructing a{" "}
            <i>phylogeny</i> we can learn about important epidemiological
            phenomena such as spatial spread, introduction timings and epidemic
            growth rate.
          </FocusParagraph>
        </div>

        <div className="col-lg-6">
          <BigSpacer />

          <h2 className={styles.H2}>Actionable Inferences</h2>

          <FocusParagraph>
            However, if pathogen genome sequences are going to inform public
            health interventions, then analyses have to be rapidly conducted and
            results widely disseminated. Current scientific publishing practices
            hinder the rapid dissemination of epidemiologically relevant
            results. We thought an open online system that implements robust
            bioinformatic pipelines to synthesize data from across research
            groups has the best capacity to make epidemiologically actionable
            inferences.
          </FocusParagraph>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <BigSpacer />

          <h2 className={styles.H2}>This Website</h2>

          <FocusParagraph>
            This website aims to provide a <i>real-time</i> snapshot of evolving
            pathogen populations and to provide interactive data visualizations
            to virologists, epidemiologists, public health officials and citizen
            scientists. Through interactive data visualizations, we aim to allow
            exploration of continually up-to-date datasets, providing a novel
            surveillance tool to the scientific and public health communities.
          </FocusParagraph>
        </div>

        <div className="col-lg-6">
          <BigSpacer />

          <h2 className={styles.H2}>Future Directions</h2>

          <FocusParagraph>
            Nextstrain is under active development and we have big plans for its
            future, including visualization, bioinformatics analysis and an
            increasing number and variety of datasets. If you have any questions
            or ideas, please <a href="/contact">contact us</a>.
          </FocusParagraph>
        </div>
      </div>

      <HugeSpacer />

      {/* Bioinformatics toolkit */}
      <ScrollableAnchor id="tools">
        <h1 className={styles.H1}>A bioinformatics and data viz toolkit</h1>
      </ScrollableAnchor>

      <FlexCenter>
        <FocusParagraphCentered>
          Nextstrain provides an open-source toolkit enabling the bioinformatics
          and visualization you see on this site. Tweak our analyses and create
          your own using the same tools we do. We aim to empower the wider
          genomic epidemiology and public health communities.
        </FocusParagraphCentered>
      </FlexCenter>

      <BigSpacer />

      <FlexCenter>
        <Button to="https://docs.nextstrain.org/en/latest/index.html">
          Read the documentation
        </Button>
      </FlexCenter>
    </div>
  );
}

/** A React Client component to fetch the group image for a tile */
function GroupImage({ group }: { group: string }): React.ReactElement {
  /** The actual group logo */
  const [groupLogo, setGroupLogo] = useState(usersIcon.src);

  useEffect(() => {
    async function getGroupLogo(group: string): Promise<void> {
      const response = await fetch(
        `/charon/getSourceInfo?prefix=/groups/${group}`,
      );

      const data = await response.json();

      if (data.avatar) {
        setGroupLogo(data.avatar);
      }
    }

    getGroupLogo(group);
  }, [group]);

  return <img className={styles.infoIconImg} src={groupLogo} alt={group} />;
}

/** A helper React Component for the logo and title header portion of the page */
function Heading(): React.ReactElement {
  return (
    <div className={styles.headingContainer}>
      <img
        className={styles.headingLogo}
        alt="Logo"
        src={nextstrainLogoSmall.src}
      />

      <div className={styles.headingTitleWrapper}>
        <div className={styles.headingTitleContainer}>
          {"Nextstrain".split("").map((letter, i) => (
            <span style={{ color: `var(--titleColor${i})` }} key={i}>
              {letter}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.headingSubtitle}>
        Real-time tracking of pathogen evolution
      </div>
    </div>
  );
}

/** A helper component to display the "narrative" icon on a group tile */
function NarrativeIcon(): React.ReactElement {
  return (
    <TooltipWrapper description="Analysis in the form of a narrative">
      <img
        className={styles.infoIconImg}
        src={bookOpenIcon.src}
        alt="narrative"
      />
    </TooltipWrapper>
  );
}

/**
 * A helper React Component to render a section entry below the title
 * of the home page, and above the expandable tiles section
 */
function Section({
  abstract,
  id,
  imgSrc,
  link,
  title,
}: {
  /** the text to display under the section title */
  abstract: string;
  /** the unique id of the section */
  id: string;
  /** an icon image to adorn the section title with */
  imgSrc: string;
  /** the URL the section title should link to */
  link: string;
  /** title of the section */
  title: string;
}): React.ReactElement {
  return (
    <div
      id={id}
      className="col-12 col-md-6 col-lg-4"
      style={{ paddingBottom: "20px" }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <a href={link}>
          <img className={styles.sectionImage} src={imgSrc} alt={title} />
          <span className={styles.sectionHeader}>{title}</span>
        </a>

        <div className={styles.sectionAbstract} style={{ flexGrow: 1 }}>
          {abstract}
        </div>

        <BigSpacer />
      </div>
    </div>
  );
}

/** A helper React Component to render one tile in the <ExpandableTile> component */
function Tile({
  tile,
}: {
  /** the Tile to render */
  tile: SplashTile;
}): React.ReactElement {
  /** Narrative detection works for all three sources:
   * 1. Core: /narratives/<narrative path>
   * 2. Community: /community/narratives/<owner>/<narrative path>
   * 3. Groups: /groups/<group>/narratives/<narrative path>
   *
   * Including slashes in the check prevents false positives.
   */
  const isNarrative: boolean = tile.url.includes("/narratives/");

  let tileImg: string;
  try {
    tileImg = require(`../../static/pathogen_images/${tile.img}`).default.src;
  } catch {
    tileImg = emptyPathogenImage.src;
  }

  return (
    <div
      className={styles.tileOuter}
      style={{ height: `${tileHeight}px`, width: `${tileWidth}px` }}
    >
      <div className={styles.tileInner}>
        <a href={tile.url}>
          <div className={styles.tileName}>{tile.name}</div>

          <div className={styles.tileImgContainer}>
            <img className={styles.tileImg} src={tileImg} alt={""} />
            <div className={styles.infoIcons}>
              <TileSourceIcon url={tile.url} isNarrative={isNarrative} />
              {isNarrative && <NarrativeIcon />}
            </div>
          </div>
        </a>

        <div className={styles.tileDescription}>{tile.description}</div>
      </div>
    </div>
  );
}

/** A helper React Component for the source icon on a Tile */
function TileSourceIcon({
  url,
  isNarrative,
}: {
  /** is this tile linking to a narrative? */
  isNarrative: boolean;
  /**
   * the URL for the dataset on the tile, used to determine what
   * to display
   */
  url: string;
}): React.ReactElement {
  let maintainers: string;
  let image: React.ReactElement;

  if (!url.startsWith("/")) {
    url = "/" + url;
  }

  if (url.startsWith("/community")) {
    const owner = isNarrative ? url.split("/")[3] : url.split("/")[2] || "";
    maintainers = `${owner} on GitHub`;

    image = (
      <img
        className={styles.infoIconImg}
        src={`https://github.com/${owner}.png?size=40`}
        alt={maintainers}
      />
    );
  } else if (url.startsWith("/groups")) {
    const group = url.split("/")[2] || "";
    maintainers = `the ${group} group`;

    // Ideally just the image src is parameterized, but the async call to get
    // the group logo must be done within useEffect in a functional component.
    image = <GroupImage group={group} />;
  }
  // Assume everything else is Nextstrain
  else {
    maintainers = "the Nextstrain team";

    image = (
      <img
        className={styles.infoIconImg}
        src={nextstrainLogoTiny.src}
        alt={maintainers}
      />
    );
  }

  // `data-tooltip-id` links this to the react-tooltip-v5 component
  return (
    <TooltipWrapper description={`Maintained by ${maintainers}`}>
      {image}
    </TooltipWrapper>
  );
}

/** A helper React Component for a tooltip */
function TooltipWrapper({
  description,
  children,
}: {
  /** the tooltip text to display */
  description: string;
  /** children inside the tooltip */
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <span
      data-tooltip-id={tooltipId}
      data-tooltip-html={description}
      data-tooltip-place="top"
    >
      {children}
    </span>
  );
}
