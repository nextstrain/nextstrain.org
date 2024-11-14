import chalk from 'chalk';
import fetch from 'node-fetch';
import { NotFound } from '../httpErrors.js';
import path from 'path';
import { fileURLToPath } from 'url';


const verbose = (msg, ...rest) => {
  if (global.verbose) {
    console.log(chalk.greenBright(`[verbose]\t${msg}`), ...rest);
  }
};
const log = (msg, ...rest) => {
  console.log(chalk.blueBright(msg), ...rest);
};
const warn = (msg, ...rest) => {
  console.warn(chalk.redBright(`[warning]\t${msg}`), ...rest);
};
const error = (msg, ...rest) => {
  console.error(chalk.redBright(`[error]\t${msg}`), ...rest);
  process.exit(2);
};

const fetchJSON = async (url) => {
  verbose(`Fetching ${url}`);
  const res = await fetch(url);

  /* Treat 403s as 404s since S3 returns 403 Forbidden for a non-existent
   * object if the principal has s3:GetObject but not s3:ListBucket.¹  This is
   * the case for many of our public-access bucket policies.
   *
   * If we need to distinguish 403s and 404s from non-S3 upstream sources in
   * the future, we can scope this check to only *.s3.amazonaws.com URLs.
   *    -trs, 13 Oct 2021
   *
   * ¹ https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadObject.html
   */
  if (res.status === 404 || res.status === 403) throw new NotFound();
  else if (res.status !== 200) throw new Error(`Couldn't fetch JSON: ${res.status} ${res.statusText}`);

  try {
    const header = res.headers[Object.getOwnPropertySymbols(res.headers)[0]] || res.headers._headers;
    verbose(`Got type ${header["content-type"]} with encoding ${header["content-encoding"] || "none"}`);
  } catch (e) {
    // potential errors here are inconsequential for the response
  }

  return res.json();
};

const responseDetails = async (response) => [
  `${response.status} ${response.statusText}`,
  await response.text()
];

/**
 * Given a list of files, return a list of URL pathnames of
 * datasets which can be fetched
 * @param {Array} files. Array of strings.
 * @returns {Array}
 */
const getDatasetsFromListOfFilenames = (filenames) => {
  /* Please see https://github.com/nextstrain/nextstrain.org/pull/65 for comments
  which indicate that this function "weirdly mixes a functional, stream-based
  approach with a procedural approach" and is a candidate for refactoring.
                                                            James // Jan 2020 */

  const jsonFiles = filenames
    .filter((file) => file.endsWith(".json"));

  // All JSON files which aren't a sidecar file with a known suffix are assumed to
  // be v2+ JSONs (aka "unified" JSONs)
  const sidecarSuffixes = ["meta", "tree", "root-sequence", "seq", "tip-frequencies", "measurements"];
  const datasets = jsonFiles
    .filter((filename) => !sidecarSuffixes.some((suffix) => filename.endsWith(`_${suffix}.json`)))
    .map((filename) => filename.replace(/[.]json$/, ""));

  // All *_meta.json files which have a corresponding *_tree.json are assumed to
  // be v1 JSONs.
  jsonFiles
    .filter((filename) => filename.endsWith("_meta.json"))
    .filter((filename) => jsonFiles.includes(filename.replace(/_meta[.]json$/, "_tree.json")))
    .map((filename) => filename.replace(/_meta[.]json$/, ""))
    .filter((filename) => !datasets.includes(filename))
    .forEach((filename) => datasets.push(filename));

  // modify the filenames to represent URL pathnames not filenames
  return datasets.map((filename) => filename
    .split("_")
    .join("/"));
};

const parseNarrativeLanguage = (narrative) => {
  const urlParts = narrative.split("/");
  let language = urlParts[urlParts.length - 2];
  if (language === 'sit-rep') language = 'en';
  return language;
};

/**
 * Normalize a plain object of HTTP headers.
 *
 * Header names are lowercased. Headers with a null, undefined, or empty string
 * value are omitted in the returned object.
 *
 * @params {object} headers
 * @returns {object}
 */
const normalizeHeaders = (headers) => {
  const withValues =
    Object.entries(headers)
      .filter(([, value]) => value !== null && value !== undefined && value !== "");

  /* Use the WHATWG Headers object to do most of the normalization, including
   * lowercasing and combining duplicate headers as appropriate.
   */
  return Object.fromEntries((new fetch.Headers(withValues)).entries());
};

/**
 * A string of the absolute path of the nextstrain.org root directory
 * (i.e. where `server.js` is)
 */
const rootDirFullPath =  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export {
  verbose,
  log,
  warn,
  error,
  fetchJSON,
  responseDetails,
  getDatasetsFromListOfFilenames,
  parseNarrativeLanguage,
  normalizeHeaders,
  rootDirFullPath,
};
