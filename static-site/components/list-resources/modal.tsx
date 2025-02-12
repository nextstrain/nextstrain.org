"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { MdClose } from "react-icons/md";

import { InternalError } from "../error-boundary";

import modal_draw from "./modal_draw";

import { Resource, VersionedResource } from "./types";

import styles from "./modal.module.css";

const lightGrey = "rgba(0,0,0,0.1)";

export const SetModalResourceContext = createContext<React.Dispatch<
  React.SetStateAction<Resource | undefined>
> | null>(null);

export function ResourceModal({
  resource,
}: {
  resource: VersionedResource;
}): React.ReactElement {
  const [ref, setRef] = useState(null);

  const setModalResource = useContext(SetModalResourceContext);
  if (!setModalResource) {
    throw new InternalError("Context not provided!");
  }
  const dismissModal: () => void = useCallback(() => {
    setModalResource(undefined);
  }, [setModalResource]);

  // FIXME figure out what type can be assigned to `node`
  // * `unknown` doesn't work
  // * `React.SetStateAction<null>` doesn't work
  // * `React.LegacyRef<HTMLDivElement>` doesn't work
  const handleRef = useCallback((node): void => {
    setRef(node);
  }, []);

  useEffect(() => {
    function _handleEsc(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        dismissModal();
      }
    }
    window.addEventListener("keydown", _handleEsc);
    return (): void => {
      window.removeEventListener("keydown", _handleEsc);
    };
  }, [dismissModal]);

  const scrollRef = useCallback((node: HTMLDivElement): void => {
    /* A CSS-only solution would be to set 'overflow: hidden' on <body>. This
    solution works well, but there are still ways to scroll (e.g. via down/up
    arrows) */
    node?.addEventListener(
      "wheel",
      (event: WheelEvent): void => {
        event.preventDefault();
      },
      false,
    );
  }, []);

  useEffect((): void => {
    if (ref && resource) {
      modal_draw(ref, resource, lightGrey);
    }
  }, [ref, resource]);

  const summary = _snapshotSummary(resource.dates);

  return (
    <div ref={scrollRef}>
      <div
        className={styles.background}
        style={{ backgroundColor: `${lightGrey}` }}
        onClick={dismissModal}
      />
      <div
        className={styles.modalContainer}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
          e.stopPropagation();
        }}
      >
        <CloseIcon onClick={dismissModal} />
        <div className={styles.title}>{resource.name.replace(/\//g, "│")}</div>
        <div style={{ paddingBottom: "5px" }}>
          <strong>
            {`${resource.dates.length} snapshots spanning ${summary.duration}: ${summary.first} - ${summary.last}`}
          </strong>
          <a
            href={`/${resource.name}`}
            rel="noreferrer noopener"
            style={{ fontSize: "1.8rem", paddingLeft: "10px" }}
            target="_blank"
          >
            (click to view the latest available snapshot)
          </a>
        </div>
        <div>{resource.updateCadence.description}</div>
        {/* d3 controlled div */}
        <div ref={handleRef} />
        <div style={{ fontStyle: "italic" }}>
          Each circle represents a previous snapshot of the dataset.
          <strong>Mouse-over the light-grey axis box</strong> to identify the
          latest available snapshot for any given date, and click to load the
          snapshot.
          <br />
          Alternatively, <strong>hover over dots</strong> to show the date the
          analysis was shared and <strong>click on a dot</strong> to load that
          particular snapshot.
          <p />
          Note: circles represent update date which may differ from when the
          analysis was run.
          {`An updated dataset doesn't necessarily mean there was new data.`}
          Finally, there may be a very recent upload which is newer than `$
          {summary.last}` which is not shown on this page
          {`(loading the "latest available snapshot" will always fetch the latest version).`}
        </div>
      </div>
    </div>
  );
}

function CloseIcon({ onClick }: { onClick: () => void }): React.ReactElement {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseOut={(): void => setHovered(false)}
      onMouseOver={(): void => setHovered(true)}
      style={{
        cursor: "pointer",
        position: "absolute",
        right: "15px",
        top: "15px",
      }}
    >
      <MdClose size="1.5em" color={hovered ? "#333" : "#999"} />
    </div>
  );
}

function _snapshotSummary(dates: string[]): {
  duration: string;
  first: string;
  last: string;
} {
  const d = [...dates].sort();
  const d1 = d[0];
  const d2 = d.at(-1);

  if (d1 === undefined || d2 === undefined) {
    throw new InternalError("Missing dates.");
  }

  const days = (new Date(d2).getTime() - new Date(d1).getTime()) / 1000 / 60 / 60 / 24;

  let duration = "";

  if (days < 100) {
    duration = `${days} days`;
  } else if (days < 365 * 2) {
    duration = `${Math.round(days / (365 / 12))} months`;
  } else {
    duration = `${Math.round(days / 365)} years`;
  }

  return { duration, first: d1, last: d2 };
}
