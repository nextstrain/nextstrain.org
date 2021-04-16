
/**
 * This function returns a path to the closest Gatsby-built HTML page
 * matching the URL request.
 *
 * Note 1: Our middleware set up allows this function to assume that both
 * (a) the request should not be handled by auspice and (b) the URL path
 * is not matched exactly by a gatsby-built page.
 *
 * Note 2: The HTML page sent to the client (chosen via this function) may not
 * be what the client renders due Gatsby's client-side routing. For instance,
 * given a URL /a/b/c this function may decide that we should return the HTML
 * page x. However if gatsby's been set up to handle URLs `a/*` with page y
 * then the client, having received page x will, in fact, end up rendering page y.
 * This is set up via the `matchPath` argument to Gatsby's `createPage` API.
 *
 * @param {function} gatsbyAssetPath
 * @param {string} path URL path being requested
 * @returns {undefined|string} the path-on-disk to a Gatsby built HTML file
 */
function getClosestParentPage(gatsbyAssetPath, path) {
  try {
    const pathParts = path.replace(/^\//, '').replace(/\/$/, '').split("/");
    switch (pathParts[0].toLowerCase()) {
      case ("flu"):
        return gatsbyAssetPath("influenza", "index.html");
      case ("sars-cov-2"): // fallthrough
      case ("ncov"):
        return gatsbyAssetPath("sars-cov-2", "index.html");
      default:
        // unknown parent page
        return undefined;
    }
  } catch (err) {
    console.log("getClosestParentPage error", String(err)); // uncomment for development purposes
  }
  return undefined;
}

module.exports = {getClosestParentPage};
