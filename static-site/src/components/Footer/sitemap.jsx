import React from "react";
import styled from "styled-components";
import { FaExternalLinkAlt } from "react-icons/fa";
import * as Styles from "../splash/styles";
import { BigSpacer } from "../../layouts/generalComponents";
import sections from "./sitemap.yaml";


export const SiteMap = () => {
  return  (
    <SiteMapContainer className="row">
      {sections.map((section) => (
        <SectionWrapper className="col-md-3 col-sm-6" key={section.title}>
          <Section>
            <BigSpacer />
            <SectionTitle $left>{section.title}</SectionTitle>
            <SectionList entries={section.entries} />
          </Section>
        </SectionWrapper>
        ))
      }
    </SiteMapContainer>
  )
}


const SectionList = ({ entries }) => {
  return (
    <UnstyledList>
      {entries.map((entry) => (
        <li key={entry.name}>
          <ListItemParagraph>
            <UncoloredLink>
              {entry.href.startsWith('http') ? (
                <a href={entry.href}  rel="noopener noreferrer" target="_blank">
                  {entry.name} <FooterIcon><FaExternalLinkAlt/></FooterIcon>
                </a>
              ) : (
                <a href={entry.href}>
                  {entry.name}
                </a>
              )}
            </UncoloredLink>
          </ListItemParagraph>
        </li>
      ))}
    </UnstyledList>
  )
}

const SiteMapContainer = styled.div`
  // Center contents
  margin: 0 auto;

  // Ensure that, on wide screens, 4 sections renders to roughly align with the
  // width of IconParagraph (rendered below this element)
  max-width: 680px;
`

// Wrapper is used to center the actual Section while allowing it to be
// left-aligned.
const SectionWrapper = styled.div`
  // Ensure the longest entry (Discussion forum ↗️) still fits on a single line
  min-width: 170px;

  // Center section contents when all sections are displayed in a single row
  @media (min-width: 680px) {
    text-align: center;
  }

  // Otherwise, when there are multiple rows, left-align so columns are aligned
  text-align: left;
`

const Section = styled.div`
  display: inline-block;
  text-align: left;
`

// The global Styles.H3 has a min-width that is undesirable here
const SectionTitle = styled.h3`
`

const UnstyledList = styled.ul`
  list-style: none;
`

const ListItemParagraph = styled(Styles.FocusParagraph)`
  line-height: 0.5;
  font-weight: 500;
`

const UncoloredLink = styled.span`
  & a {
    color: #000 !important;
  }
`

const FooterIcon = styled.span`
  margin-left: 2px;
  font-size: 12px;
`
