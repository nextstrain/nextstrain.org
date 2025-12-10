"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ErrorMessage from "../../../components/error-message";

import CommunityRepoPage from "./community-repo-page";
import CommunityPageContent from "./content";

/**
 * A React Client Component to handle routing/rendering for/of
 * `/community` and other URLs under that namespace
 *
 * This component serves a variety of requests, in a few different ways.
 *
 * - Requests for `/community` or `/community/narratives` -> display
 *   <CommunityPageContent>, status 200
 * - Requests for `/community/:thing` or `/community/narratives/:thing`
 *   -> display <ErrorMessage> saying the dataset or narrative doesn't
 *   exist over <CommunityPageContent>, status 404
 * - Requests for `/community/:user/:repo` or `/community/narratives/:user/:repo`
 *   when `github.com/:user/:repo` doesn't exist or is not a public repo -> display only
 *   <ErrorMessage> saying the repo is not accessible, status 404
 * - Requests for `/community/:user/:repo` or `/community/narratives/:user/:repo`
 *   when `github.com/:user/:repo` is a public repo -> display
 *   <CommunityRepoPage> with information about that repository, status 404
 * - Requests for `/community/:user/:repo/:extra` or `/community/narratives/:user/:repo/:extra`
 *   when `github.com/:user/:repo` is a public repo -> display
 *   <ErrorMessage> saying the dataset or narrative doesn't exist
 *   over <CommunityRepoPage> with information, status 404
 *
 * Note that the 404 status codes are being set/returned at the
 * Express router code, as a side effect of how that code re-directs
 * requests that don't directly load a dataset or narrative into the
 * Next.js part of the web site. This router code does not make use of
 * the Next.js `notFound()` method because the 404 status has already
 * been set. For the requests that don't display an <ErrorMessage>,
 * the status should _arguably_ be 200, but I'm not going to worry
 * about that at the moment. - @genehack, 1 Aug 2025
 */
export default function CommunityPageRouter(): React.ReactElement {
  // this flag controls whether we show the "main" content or the
  // "repo-specific" content. "main" versus "repo-specific" are
  // exclusive of each other.
  const [showMainOrRepo, setShowMainOrRepo] = useState<string>("");

  // flag for whether or not `/narratives` appeared in the request after `/community`
  const [isNarrative, setIsNarrative] = useState<boolean>(false);

  // storage for the additional request bits corresponding to user,
  // repo, and anything beyond that in the request
  const [user, setUser] = useState<string>("");
  const [repo, setRepo] = useState<string>("");
  const [extra, setExtra] = useState<string>("");

  // used to store the request path so it can be displayed in an error message
  const [errorPath, setErrorPath] = useState<string>("");

  // get the requested path, to be parsed in the `useEffect()` hook below
  const params = useParams();

  useEffect((): void => {
    async function parseRequestUrl(): Promise<void> {
      if (params && params["community"]) {
        // I don't think `params["community"]` will ever _NOT_ be an
        // array, but this guard makes the typechecker happy and
        // really isn't that what matters
        if (Array.isArray(params["community"])) {
          // make a copy via slice() to keep things stable
          const path = params["community"].slice();
          const fullPath = `nextstrain.org/community/${path.join("/")}`;

          if (path[0] && path[0] === "narratives") {
            setIsNarrative(true);
            path.shift();
          }

          // do we have additional path elements?
          if (!path[0]) {
            // no == show main page
            setShowMainOrRepo("main");
          } else if (path[0] && !path[1]) {
            // yes, but we only have the first element == show an
            // error dialog followed by the main page
            setErrorPath(fullPath);
            setShowMainOrRepo("main");
          } else {
            // yes, at least two elements == extract path components
            // into state and show repo-specific page
            setUser(path[0] ? path[0] : "");
            setRepo(path[1] ? path[1] : "");
            setExtra(path[2] ? path.slice(2).join("/") : "");

            setShowMainOrRepo("repo");
          }
        } else {
          // i don't think this will ever happen, but yell if it does
          throw new Error(
            `community placeholder "${params["community"]}" is somehow not an array?!?`,
          );
        }
      } else {
        // no params = load regular page
        // N.b, this means `/community/narratives`, by itself, loads
        // the page without an error banner. This is intentional.
        setShowMainOrRepo("main");
      }
    }

    parseRequestUrl();
  }, [params]);

  return (
    <>
      {errorPath && (
        <ErrorMessage
          title={`The community repository, dataset, or narrative "${errorPath}" doesn't exist.`}
          contents={<p>Here is the community page instead.</p>}
        />
      )}

      {showMainOrRepo === "main" && <CommunityPageContent />}

      {showMainOrRepo === "repo" && (
        <CommunityRepoPage
          user={user}
          repo={repo}
          extra={extra}
          isNarrative={isNarrative}
        />
      )}
    </>
  );
}
