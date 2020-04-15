import React from 'react'; // eslint-disable-line
import { Helmet } from "react-helmet"; // eslint-disable-line
import ncovCards from "../../static-site/src/components/Cards/nCoVCards";
import communityCards from "../../static-site/src/components/Cards/communityCards";
import coreCards from "../../static-site/src/components/Cards/coreCards";
import narrativeCards from "../../static-site/src/components/Cards/narrativeCards";
import config from "../../static-site/data/SiteConfig";

const siteImage = config.siteLogo;
const allCards = [ncovCards, communityCards, coreCards, narrativeCards];
const imageList = generateImageLookup(allCards, siteImage);

/* This function creates a list that pairs path regexes to their splash images. */
// Example output:
// [
//   [/^\/zika.*/, "/splash_images/zika.png"],
//   [/^\/WNV.*/, "/splash_images/wnv.jpg"],
//   [/.*/, "/logos/nextstrain-logo-small.png"]
// ]
function generateImageLookup(cards, defaultImage) {
  let imageLookup = [].concat(...cards);
  // Sort reverse alphabetically so that e.g. "/ncov/foo" precedes "/ncov"
  imageLookup.sort((a, b) => b.url.localeCompare(a.url));
  // Extract path and image from each card, making the path into a valid regex
  imageLookup = imageLookup.map((el) => {
    const escapedUrl = escapeRegExp(el.url);
    const regexString = `^${escapedUrl}.*`;
    const regex = new RegExp(regexString);
    return [regex, `/splash_images/${el.img}`];
  });
  // Append the catch-all default image
  imageLookup.push([new RegExp(".*"), defaultImage]);
  return imageLookup;
}

/* Escapes any regex special characters from a string
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions */
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

/* Iterates through the paths and returns the associated image
path if the regex matches the current window path. This will
return the default siteImage if no path is matched. */
function getSocialImage(windowPath, imageLookup=imageList, defaultImage=siteImage) {
  for (const [regex, imagePath] of imageLookup) {
    if (regex.test(windowPath)) {
      return imagePath;
    }
  }
  return defaultImage;
}

const SocialTags = ({metadata, pageTitle}) => {
  const url = `${window.location.origin}${window.location.pathname}`;
  const socialImagePath = getSocialImage(window.location.pathname);
  const socialImageUrl = `${window.location.origin}${socialImagePath}`;

  /* react-helmet combines these with existing header values.
  These tags will override shared tags from earlier in the tree. */
  return (
    <Helmet>
      {/* OpenGraph tags */}
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      {metadata && metadata.title ?
        <meta property="og:description" content={metadata.title} /> :
        null}
      <meta property="og:image" content={socialImageUrl} />

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={pageTitle} />
      {metadata && metadata.title ?
        <meta name="twitter:description" content={metadata.title} /> :
        null}
      <meta name="twitter:image" content={socialImageUrl} />
    </Helmet>
  );
};

export default SocialTags;
