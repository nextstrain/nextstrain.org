import React from "react";

import fredHutchLogo from "../../static/logos/fred-hutch-logo-small.png";
import uniBasLogo from "../../static/logos/unibas-logo.svg";
import nihLogo from "../../static/logos/nih-logo.jpg";
import bmgfLogo from "../../static/logos/bmgf.png";
import mapBoxLogo from "../../static/logos/mapbox-logo-black.svg";
import sibLogo from "../../static/logos/sib-logo.png";
import ospLogo from "../../static/logos/osp-logo-small.png";
import bzLogo from "../../static/logos/bz_logo.png";

import styles from "./styles.module.css";
import { width } from "../../src/components/Groups/Tiles/styles";

type Logo = {
  imgSrc: string;
  href: string;
  width: number;
};

export default function Logos(): React.ReactElement {
  const logos: Logo[] = [
    {
      imgSrc: fredHutchLogo.src,
      href: "http://www.fredhutch.org/",
      width: 90,
    },
    {
      imgSrc: uniBasLogo.src,
      href: "http://www.unibas.ch/",
      width: 110,
    },
    {
      imgSrc: nihLogo.src,
      href: "https://www.nih.gov/",
      width: 60,
    },
    {
      imgSrc: bmgfLogo.src,
      href: "https://www.gatesfoundation.org/",
      width: 130,
    },
    {
      imgSrc: sibLogo.src,
      href: "https://www.sib.swiss/",
      width: 80,
    },
    {
      imgSrc: mapBoxLogo.src,
      href: "https://www.mapbox.com",
      width: 110,
    },
    {
      imgSrc: ospLogo.src,
      href: "https://www.nih.gov/news-events/news-releases/open-science-prize-announces-epidemic-tracking-tool-grand-prize-winner",
      width: 100,
    },
    {
      imgSrc: bzLogo.src,
      href: "http://biozentrum.org/",
      width: 115,
    },
  ];

  return (
    <div className="row">
      <div className="col-lg-12">
        <p className="footerParagraph">Nextstrain is supported by</p>

        <div className={styles.allLogosContainer}>
          {logos.map((logo: Logo) => (
            <Logo href={logo.href} imgSrc={logo.imgSrc} width={logo.width} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Logo({
  href,
  imgSrc,
  width,
}: {
  href: string;
  imgSrc: string;
  width: number;
}): React.ReactElement {
  return (
    <a
      className={styles.logoLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className={styles.logoImageSpan} />
      <img
        className={styles.logoImage}
        style={{ width: `${width}px`, maxWidth: `${width}px` }}
        alt="logo"
        src={imgSrc}
        width={width}
      />
    </a>
  );
}

// export const Logos = () => (
//   <div className="row">
//     <div className="col-lg-12">

//       <Styles.FooterParagraph>
//         Nextstrain is supported by
//       </Styles.FooterParagraph>

//       <AllLogosContainer>
//         <Logo href="http://www.fredhutch.org/" imgSrc={fredHutchLogo.default.src} width={90}/>
//         <Logo href="http://www.unibas.ch/" imgSrc={uniBasLogo.default.src} width={110}/>
//         <Logo href="https://www.nih.gov/" imgSrc={nihLogo.default.src} width={60}/>
//         <Logo href="https://www.gatesfoundation.org/" imgSrc={bmgfLogo.default.src} width={130}/>
//         <Logo href="https://www.sib.swiss/" imgSrc={sibLogo.default.src} width={80}/>
//         <Logo href="https://www.mapbox.com" imgSrc={mapBoxLogo.default.src} width={110}/>
//         <Logo href="https://www.nih.gov/news-events/news-releases/open-science-prize-announces-epidemic-tracking-tool-grand-prize-winner" imgSrc={ospLogo.default.src} width={100}/>
//         <Logo href="http://biozentrum.org/" imgSrc={bzLogo.default.src} width={115}/>
//       </AllLogosContainer>
//     </div>
//   </div>
// );
