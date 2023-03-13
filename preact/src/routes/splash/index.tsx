import Preact, {h, Component} from "preact";
import { Link } from 'preact-router/match';


// const Section = ({title, abstract, cards, buttonText, buttonLink}) => (
//   <div className="col-md-6" style={{paddingBottom: "40px"}}>
//     <div style={{display: "flex", flexDirection: "column", alignItems: "center", height: "100%"}}>
//       <Styles.H1>{title}</Styles.H1>
//       <Styles.CenteredFocusParagraph style={{flexGrow: 1}}>
//         {abstract}
//       </Styles.CenteredFocusParagraph>
//       <div style={{display: "flex", justifyContent: "space-evenly", flexWrap: "wrap"}}>
//         <Cards
//           squashed
//           compactColumns
//           cards={cards}
//         />
//       </div>
//       <BigSpacer/>
//       <Styles.Button to={buttonLink}>
//         {buttonText}
//       </Styles.Button>
//     </div>
//   </div>
// );


class Splash extends Component {
  // constructor() {
  //   super();
  //   configureAnchors({ offset: -10 });
  // }

  // static contextType = UserContext;

  render() {
    return (
      <div className="bodyContainer container splash">

        {/* <BigSpacer />
        <FlexCenter>
          <Title />
        </FlexCenter>

        <HugeSpacer />
        <Styles.H1> Real-time tracking of pathogen evolution </Styles.H1>
        <SmallSpacer />

        <FlexCenter>
          <Styles.CenteredFocusParagraph>
            Nextstrain is an open-source project to harness the scientific and public health
            potential of pathogen genome data. We provide a continually-updated view of publicly
            available data alongside powerful analytic and visualization tools for use by the
            community. Our goal is to aid epidemiological understanding and improve outbreak
            response. If you have any questions, or simply want to say hi, please give us a shout at
            hello<span style={{display: "none"}}>obfuscate</span>@nextstrain.org.
          </Styles.CenteredFocusParagraph>
        </FlexCenter>

        <BigSpacer/>

        <FlexCenter>
          <Styles.Button to="#philosophy">
            Read More
          </Styles.Button>
        </FlexCenter>

        <HugeSpacer/>
        <BigSpacer/>

        <div style={{display: "flex", justifyContent: "space-evenly", flexWrap: "wrap"}}>
          <Section
            title="SARS-CoV-2 (COVID-19)"
            abstract="We are incorporating SARS-CoV-2 genomes as soon as they are shared and providing analyses and situation reports.
            In addition we have developed a number of resources and tools, and are facilitating independent groups to run their own analyses."
            cards={nCoVCards}
            buttonText="See all resources"
            buttonLink="/sars-cov-2"
          />
          <Section
            title="Nextstrain Groups"
            abstract="We want to enable research labs, public health entities and others to share their datasets and narratives through Nextstrain with complete control of their data and audience."
            cards={createGroupCards([{name: "neherlab"}, {name: "spheres"}])}
            buttonText="See all groups"
            buttonLink="/groups"
          />
          <Section
            title="Explore pathogens"
            abstract="Genomic analyses of specific pathogens kept up-to-date by the Nextstrain team."
            cards={coreCards}
            buttonText="See all pathogens"
            buttonLink="/pathogens"
          />
          <Section
            title="From the community"
            abstract={(<>
              Analyses by independent groups <a href="https://docs.nextstrain.org/en/latest/guides/share/community-builds.html">stored and
              accessed via public GitHub repos</a>
            </>)}
            cards={communityDatasets.data.filter((c) => c?.card?.frontpage).map((e) => e.card).slice(0, 2)}
            buttonText="Learn more"
            buttonLink="/community"
          />
          <Section
            title="Narratives"
            abstract="Narratives are a method of data-driven storytelling. They allow authoring of content which is displayed alongside a view into the data."
            cards={narrativeCards}
            buttonText="Find out more"
            buttonLink="https://docs.nextstrain.org/en/latest/guides/communicate/narratives-intro.html"
          />
        </div>
 */}

        <h1>Philosophy</h1>
        <div className="row">
          <div className="col-md-6">
            <div className="bigSpacer"/>
            <h2>Pathogen Phylogenies</h2>
            <p className="focusParagraph">
              In the course of an infection and over an epidemic, pathogens naturally accumulate
              random mutations to their genomes. This is an inevitable consequence of error-prone
              genome replication. Since different genomes typically pick up different mutations,
              mutations can be used as a marker of transmission in which closely related genomes
              indicate closely related infections. By reconstructing a <i>phylogeny</i> we can learn
              about important epidemiological phenomena such as spatial spread, introduction timings
              and epidemic growth rate.
            </p>
          </div>
          <div className="col-md-6">
            <div className="bigSpacer"/>
            <h2>Actionable Inferences</h2>
            <p className="focusParagraph">
              However, if pathogen genome sequences are going to inform public health interventions,
              then analyses have to be rapidly conducted and results widely disseminated. Current
              scientific publishing practices hinder the rapid dissemination of epidemiologically
              relevant results. We thought an open online system that implements robust
              bioinformatic pipelines to synthesize data from across research groups has the best
              capacity to make epidemiologically actionable inferences.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="bigSpacer"/>
            <h2>This Website</h2>
            <p className="focusParagraph">
              This website aims to provide a s<i>real-time</i> napshot of evolving pathogen
              populations and to provide interactive data visualizations to virologists,
              epidemiologists, public health officials and citizen scientists. Through interactive
              data visualizations, we aim to allow exploration of continually up-to-date datasets,
              providing a novel surveillance tool to the scientific and public health communities.
            </p>
          </div>
          <div className="col-md-6">
            <div className="bigSpacer"/>
            <h2>Future Directions</h2>
            <p className="focusParagraph">
              Nextstrain is under active development and we have big plans for its future, including
              visualization, bioinformatics analysis and an increasing number and variety of
              datasets. If you have any questions or ideas, please give us a shout at hello
              <span style={{display: "none"}}>obfuscate</span>
              @nextstrain.org.
            </p>
          </div>
        </div>

        <div className="bigSpacer"/>

        <h1>A bioinformatics and data viz toolkit</h1>

        <div className="flexCenter">
          <p className="centeredFocusParagraph">
            Nextstrain provides an open-source toolkit enabling the bioinformatics and visualization
            you see on this site. Tweak our analyses and create your own using the same tools we do.
            We aim to empower the wider genomic epidemiology and public health communities.
          </p>
        </div>

        <div className="bigSpacer"/>

        <div className="flexCenter">
          <button href="https://docs.nextstrain.org/en/latest/index.html">
            Read the documentation
          </button>
        </div>

        <div className="bigSpacer"/>

        <Link activeClassName="active" href="/forecasts" className="noUnderline">
          <div className="flexCenter">
            <button href="https://docs.nextstrain.org/en/latest/index.html">
              Test Forecasts Page
            </button>
          </div>
        </Link>

        {/* <Footer splashImagesCredit/> */}

      </div>
    );
  }
}

export default Splash;
