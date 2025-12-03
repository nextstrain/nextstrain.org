"use client";

import React, { useEffect, useState } from "react";

import _sortBy from "lodash/sortBy";
import Collapsible from "react-collapsible";
import { FaAngleUp, FaAngleDown, FaFile } from "react-icons/fa";

import { parseNcovSitRepInfo } from "../../../auspice-client/customisations/languageSelector";

import FlexCenter from "../../components/flex-center";
import { FocusParagraphCentered } from "../../components/focus-paragraph";
import { DataFetchError } from "../../data/SiteConfig";

import { LanguageObject, NcovSitRepInfo, SitRepJson } from "./types";

import styles from "./situation-reports-by-language.module.css";

const charonGetAvailableAddress = "/charon/getAvailable";

/**
 * A React Client Component to render all situation reports for a
 * given pathogen.
 *
 * Data is obtained on page load by a API call to /charon/getAvailable.
 */
export default function SituationReportsByLanguage(): React.ReactElement {
  const [hasError, setError] = useState<boolean>(false);
  const [narrativesByLang, setNarrativesByLang] = useState<LanguageObject[]>(
    [],
  );

  useEffect((): void => {
    async function fetchSitReps(): Promise<void> {
      try {
        const response = await fetch(charonGetAvailableAddress);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch available situation report narratives from ${charonGetAvailableAddress}: ${response.status} ${response.statusText}`,
          );
        }

        const sitRepsJson = await response.json();

        setNarrativesByLang(parseNarrativesByLang(sitRepsJson));
      } catch (err) {
        console.log(
          "The following error occurred during fetching or parsing situation reports:",
          err,
        );
        setError(true);
      }
    }

    fetchSitReps();
  }, []);

  return (
    <>
      {hasError && (
        <FocusParagraphCentered>
          <DataFetchError />
        </FocusParagraphCentered>
      )}

      {/* Sit Reps */}
      {!hasError &&
        narrativesByLang &&
        narrativesByLang.map((language) => (
          <div key={language.languageNative}>
            <Collapsible
              triggerWhenOpen={
                <CollapseTitle name={language.languageNative} isExpanded />
              }
              trigger={<CollapseTitle name={language.languageNative} />}
              triggerStyle={{ cursor: "pointer", textDecoration: "none" }}
              // start with English open. Later we can take this from browser settings using Jover's code?
              open={language.languageNative === "English"}
            >
              {/* Begin collapsible content */}
              <div className="row">
                {Array.from(language.narratives.entries()).map(
                  ([index, narrative]) => (
                    <div key={narrative.url} className="col-md-4">
                      <FlexCenter>
                        <a href={narrative.url}>
                          <div
                            className={styles.sitRepTitle}
                            style={{ fontWeight: index === 0 ? "600" : "500" }}
                          >
                            <FaFile />
                            {" " + narrative.date}
                          </div>
                        </a>
                      </FlexCenter>
                    </div>
                  ),
                )}
              </div>
            </Collapsible>
          </div>
        ))}
    </>
  );
}

function parseNarrativesByLang(json: SitRepJson): LanguageObject[] {
  const narrativesByLanguage: Record<string, LanguageObject> = {};

  json.narratives
    .filter((o) => o.request)
    .map((o) => o.request)
    .map(parseNcovSitRepInfo)
    .forEach((sitrep: NcovSitRepInfo | null) => {
      if (sitrep !== null) {
        sitrep.url = "/" + sitrep.url;

        if (narrativesByLanguage[sitrep.languageCode]) {
          narrativesByLanguage[sitrep.languageCode]?.narratives.push(sitrep);
        } else {
          narrativesByLanguage[sitrep.languageCode] = {
            languageCode: sitrep.languageCode,
            languageNative: sitrep.languageNative,
            narratives: [sitrep],
          };
        }
      }
    });

  const languageObjects: LanguageObject[] = Object.values(narrativesByLanguage);

  // sort most recent dates first within each language
  languageObjects.forEach((l) => {
    l.narratives.sort().reverse();
  });

  // English first then by language code
  return _sortBy(languageObjects, [
    (o: LanguageObject) => o.languageNative !== "English",
    (o: LanguageObject) => o.languageCode,
  ]);
}

/** A helper component for rendering a collapsible title element */
function CollapseTitle({
  name,
  isExpanded = false,
}: {
  /** the name of the element */
  name: string;

  /** whether or not it is expanded */
  isExpanded?: boolean;
}): React.ReactElement {
  return (
    <div className={styles.titleContainer}>
      <span className={styles.name}>{name}</span>
      <span className={styles.iconContainer}>
        {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
      </span>
    </div>
  );
}
