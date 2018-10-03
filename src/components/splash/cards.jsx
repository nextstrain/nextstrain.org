import React from "react";
import * as Styles from "./styles";

const cards = [
  {
    img: "seasonalinfluenza.png",
    url: "/flu/seasonal",
    title: "Seasonal Influenza"
  },
  {
    img: "wnv.jpg",
    url: "/WNV",
    title: "West Nile Virus"
  },
  {
    img: "lassa.png",
    url: "/lassa",
    title: "Lassa"
  },
  {
    img: "mumps.jpg",
    url: "/mumps",
    title: "Mumps"
  },
  {
    img: "zika.png",
    url: "/zika",
    title: "Zika"
  },
  {
    img: "ebola.png",
    url: "/ebola",
    title: "Ebola"
  },
  {
    img: "dengue.png",
    url: "/dengue",
    title: "Dengue"
  },
  {
    img: "avianinfluenza.png",
    url: "/flu/avian",
    title: "Avian Influenza"
  },
  {
    img: "measles.jpg",
    url: "/measles",
    title: "Measles"
  },
  {
    img: "enterovirus.jpg",
    url: "/enterovirus/d68",
    title: "Enterovirus D68"
  },
  {
    img: "tb.jpg",
    url: "/tb",
    title: "Tuberculosis"
  }
];

export const generateTiles = () => (
  <div className="row">
    {cards.map((d) => (
      <div key={d.title}>
        <div className="col-sm-4">
          <Styles.CardOuter>
            <Styles.CardInner>
              <a href={`${d.url}`}>
                <Styles.CardTitle>
                  {d.title}
                </Styles.CardTitle>
                <Styles.CardImg src={require(`../../../static/splash_images/${d.img}`)} alt={""} />
              </a>
            </Styles.CardInner>
          </Styles.CardOuter>
        </div>
      </div>
    ))}
  </div>
);
