import React from "react";
import GenericPage from "../layouts/generic-page";
import {version} from "styled-components";

import PanelWithCards from "../components/panels/panelWithCards";
import { Panel, PanelContainer} from "../components/panels/panelStyles";
import { UserContext } from "../layouts/userDataWrapper";
import nCoVCards from "../components/Cards/nCoVCards";
import coreCards from "../components/Cards/coreCards";
import communityCards from "../components/Cards/communityCards";
import narrativeCards from "../components/Cards/narrativeCards";
import Blurb from "../components/Blurb/Blurb";

const genericTitle = "Generic Title";
const genericSubtitle = "A showcase of datasets created by independent researchers and shared through GitHub";

class Index extends React.Component { //eslint-disable-line
  render() {
    console.log(version)
    return (
      <GenericPage location={this.props.location}>

        <Blurb title="Testing Page for different collections of components">
          As we use media queries, to test mobile you must resize the viewport (we can't just create a small div here)
          P.S. This is rendered in a blurb component
        </Blurb>

        <Blurb title="Another Blurb component" buttons={[{to: "/", label: "splash page"}]}>
          <div>
            This time with the children as a div, buttons (prop) and a list, which we render as left-aligned
            <ol>
              <li>one</li>
              <li>two</li>
              <li>three</li>
            </ol>
            <ul>
              <li>a point</li>
              <li>another point</li>
            </ul>
          </div>
        </Blurb>

        <p>Following card selection component isn't constrained (note that we don't intent to use this):</p>
        <PanelWithCards title={genericTitle} subtitle={genericSubtitle}/>

        <p>Here's a very simple PanelContainer with one Panel</p>
        <PanelContainer>
          <PanelWithCards title={genericTitle} subtitle={genericSubtitle}/>
        </PanelContainer>

        <p>Here's an example of a PanelContainer with two children</p>
        <PanelContainer>
          <PanelWithCards title={genericTitle} subtitle={genericSubtitle}/>
          <PanelWithCards title={genericTitle} subtitle={genericSubtitle}/>
        </PanelContainer>

        <p>Here's an example of a PanelContainer with four panels as children, the first of which is "fullwidth"</p>
        <PanelContainer>
          <PanelWithCards fullwidth title={"Example fullwidth <PanelWithCards>"} subtitle={"This <PanelWithCards> sets the 'fullwidth' prop"}/>
          <Panel>
            Here's normal (bespoke) content rendered within a Panel component which sorts out the dimensions (but nothing else)
          </Panel>
          <PanelWithCards
            title={"Example panel with cards"}
            subtitle={"This PanelWithCards component provides a 'cards' prop with three cards, but no image paths so they are rendered as colour swatches"}
            cards={[{title:'a', url: '/'}, {title: 'b', url: '/'}, {title: 'c', url: '/'}]}
            buttons={[{label: "1/2"}, {label: "2/2"}]}
          />
          <PanelWithCards title={"title here"} subtitle={"subtitle here"}/>
        </PanelContainer>

        <p>Here's an example of what the main splash page might look like</p>
        <PanelContainer>
          <PanelWithCards
            title="SARS-CoV-2 (COVID-19)"
            subtitle="We are incorporating SARS-CoV-2 genomes as soon as they are shared and providing analyses and situation reports. In addition we have developed a number of resources and tools, and are facilitating independent groups to run their own analyses."
            buttons={[{to: "/sars-cov-2", label: "SARS-CoV-2 resources page"}]}
            cards={[nCoVCards[1]]}
          />
          <PanelWithCards
            title="Nextstrain Curated Analyses"
            subtitle="Genomic analyses of specific pathogens kept up-to-date by the Nextstrain team."
            buttons={[{to: "/pathogens", label: "see all"}]}
            cards={[coreCards[1], coreCards[7], coreCards[9], coreCards[3]]}
          />
          <GroupsSection/>
          <PanelWithCards
            title="Community Sharing"
            subtitle="A showcase of datasets created by independent researchers and shared through GitHub"
            buttons={[{to: "/community", label: "see all"}]}
            cards={[communityCards[0], communityCards[1], communityCards[4]]}
          />
          <PanelWithCards
            title="Narratives"
            subtitle="Interactive situation reports which explain the results of an analysis"
            buttons={[{to: "/narratives", label: "learn more"}]}
            cards={[nCoVCards[2], narrativeCards[2]]}
          />
        </PanelContainer>

      </GenericPage>
    );
  }
}

export default Index;


/**
 * This has to be a component itself, as it needs to access
 * UserContext, which means it has to be a _child_ of `<GenericPage>`
 */
class GroupsSection extends React.Component { //eslint-disable-line
  static contextType = UserContext;
  render() {
    /**
     * This is essentially a copy-and-paste of the function in `userGroups.jsx`
     * but as this work is a proof-of-principle, I didn't want to modify
     * production code.
     */
    const loggedIn = !!this.context.user;
    const cards = this.context.visibleGroups ?
      this.context.visibleGroups
        .map((g) => ({
          title: g.name,
          url: `/groups/${g.name}`,
          private: g.private
        }))
        .filter((c) => loggedIn ? c.private : true) :
      [];
    return (
      <PanelWithCards
        title="Nextstrain Groups"
        subtitle={loggedIn?
          `Private groups which which you (${this.context.user.username}) have access to:` :
          `Publicly available groups:`
        }
        cards={cards}
        buttons={[{to: "/groups", label: "see all groups"}]}
      />
    );
  }
}
