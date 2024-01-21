
/**
 * Generates second tree options for a given dataset.
 *
 * Replaces segment within urlParts with every other segment in
 * given segments array
 *
 * @param {[String]} urlParts
 * @param {[String]} segments
 */
const generateSecondTreeOptions = (urlParts, segments) => {
  // Return empty array if there are no segments
  if (segments.length === 0) return [];

  // Find segment in urlParts
  const currentSegment = segments.filter((seg) => urlParts.indexOf(seg) !== -1)[0];
  const segmentIndex = urlParts.indexOf(currentSegment);

  // Generate second tree options by replacing segment in urlParts
  const secondTreeOptions = segments
    .filter((segment) => segment !== currentSegment) // Remove current segment from segments array
    .map((segment) => {
      const newUrl = urlParts.slice();
      newUrl[segmentIndex] = segment;
      return newUrl.join("/");
    });

  return secondTreeOptions;
};

export const convertManifestJsonToAvailableDatasetList = (old) => {
  const allUrls = {}; /* holds all URLs as keys and second tree options as value */
  const defaults = {}; /* holds the defaults, used to complete incomplete paths */
  let segments = []; /* holds the genome segments, used to find second tree options */

  /*
    if there's only one key in the object it's the "name" of the level
    in the hierarchy, e.g. "category" or "lineage", which we skip over.
    Note that for levels with only 1 option there's 2 keys (one is "default")
  */
  const skipLevelNameKeys = (obj) => {
    const keys = Object.keys(obj);
    if (keys.length === 1) {
      obj = obj[keys[0]];
    }
    return obj;
  };

  /**
   * Iterates over an object to build an array of URL components to be used
   * for a future data request.
   *
   * SIDE EFFECT: sets segments based on obj keys and resets segments based on
   * lenght of partsSoFar.
   *
   * @param {[String]} partsSoFar
   * @param {Object} obj
   */
  const recursivelyBuildUrlParts = (partsSoFar, obj) => {
    if (typeof obj === "string") {
      allUrls[partsSoFar.join("/")] = generateSecondTreeOptions(partsSoFar, segments);
    }

    const flattenedObj = skipLevelNameKeys(obj);
    const keys = Object.keys(flattenedObj);

    const defaultValue = flattenedObj.default;
    if (!defaultValue) {
      return;
    }
    defaults[partsSoFar.join("/")] = defaultValue;

    const orderedKeys = keys.filter((k) => k !== "default");

    if (partsSoFar.length === 1) {
      segments = [];
    }
    if (Object.keys(obj)[0] === "segment") {
      segments = orderedKeys.slice();
    }

    orderedKeys.forEach((key) => {
      const newParts = partsSoFar.slice();
      newParts.push(key);
      recursivelyBuildUrlParts(newParts, flattenedObj[key]);
    });
  };

  recursivelyBuildUrlParts([], old.pathogen);

  return {
    datasets: Object.keys(allUrls),
    secondTreeOptions: allUrls,
    defaults
  };
};
