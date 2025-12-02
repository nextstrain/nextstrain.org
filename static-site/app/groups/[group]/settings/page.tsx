"use client";

import React, { useCallback, useEffect, useState } from "react";

import Button from "../../../../components/button";
import ErrorMessage from "../../../../components/error-message";
import { FlexGrid, FlexGridRight } from "../../../../components/flex-grid";
import { FocusParagraphCentered } from "../../../../components/focus-paragraph";
import { HugeSpacer, MediumSpacer } from "../../../../components/spacers";

import { canUserEditGroupSettings } from "../utils";

import styles from "./page.module.css";

interface LogoType {
  current: string | null;
  new: File | null;
}

const emptyErrorMessage = {
  title: "",
  contents: <></>,
};

const OVERVIEW_TEMPLATE = `---
title:
byline:
website:
showDatasets:
showNarratives:
---

<!-- Replace this line with a description of your group. -->
`;

const UNAUTHORIZED_MESSAGE = (
  <>
    You must have the owners role within a group to edit group settings.
    <br />
    If your permissions have changed recently, try{" "}
    <a href="/logout">logging out</a> and logging back in.
    <br />
  </>
);

/**
 * A React Client Component to display the logo and settings for a
 * given `group` and allow them to be updated.
 */
export default function GroupSettingsPage({
  params,
}: {
  params: {
    /** the name of the group whose logo and settings will be shown */
    group: string;
  }
}): React.ReactElement {
  const { group } = params;

  /** the props for an <ErrorMessage> component, displayed when there are problems */
  const [errorMessage, setErrorMessage] = useState<{
    title: string;
    contents: React.ReactElement;
  }>(emptyErrorMessage);
  /** a flag for whether the logged-in user can access this page */
  const [userAuthorized, setUserAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = `"${group}" Group Settings - Nextstrain`;

    async function checkUserAuthz(): Promise<void> {
      setUserAuthorized(await canUserEditGroupSettings(group));
    }

    checkUserAuthz();
  }, [group]);

  /**
   * helper to pass to embedded components so they can clear the
   * error message if needed
   */
  function clearError(): void {
    setErrorMessage(emptyErrorMessage);
  }

  /**
   * helper to pass to embedded components so they can set the error
   * message if needed. Accepts an optional `details` string to
   * display additional information.
   */
  function setError(details?: string): void {
    setErrorMessage({
      title:
        "An error occurred when trying to fetch or update group settings. Please try again.",
      contents: details ? <p>Error details: {details}</p> : <></>,
    });
  }

  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      <FlexGridRight>
        <Button to={`/groups/${group}`}>Return to {`"${group}"`} Page</Button>
      </FlexGridRight>

      <MediumSpacer />

      {errorMessage.title && (
        <ErrorMessage
          title={errorMessage.title}
          contents={errorMessage.contents}
        />
      )}

      <h2 className="centered">Editing {`"${group}"`} Group Settings</h2>

      <HugeSpacer />

      {userAuthorized === null ? (
        <h4 className="centered">Checking user role in group</h4>
      ) : userAuthorized ? (
        <FlexGrid style={{ minHeight: "500px" }}>
          <EditLogoForm
            group={group}
            setError={setError}
            clearError={clearError}
          />
          <EditOverviewForm
            group={group}
            setError={setError}
            clearError={clearError}
          />
        </FlexGrid>
      ) : (
        <ErrorMessage title={UNAUTHORIZED_MESSAGE} contents=<></> />
      )}
    </>
  );
}

/**
 * A React Client Component to fetch, display, and allow editing of
 * the logo for a given `group`
 */
function EditLogoForm({
  group,
  setError,
  clearError,
}: {
  /** the group to operate on */
  group: string;
  /** helper function to set an <ErrorMessage> in a parent component */
  setError: (details?: string) => void;
  /** helper function to clear an <ErrorMessage> in a parent component */
  clearError: () => void;
}): React.ReactElement {
  /** the logo for the group */
  const [logo, setLogo] = useState<LogoType>({
    current: null,
    new: null,
  });
  /** flag for whether we're in the middle of deleting a logo */
  const [deletionInProgress, setDeletionInProgress] = useState(false);
  /** flag for whether we're in the middle of uploading a logo */
  const [uploadInProgress, setUploadInProgress] = useState(false);

  /** helper function to fetch the group logo, cached via useCallback */
  const getGroupLogo: () => Promise<string | null> = useCallback(async () => {
    clearError();

    try {
      const response = await fetch(`/groups/${group}/settings/logo`);
      if (response.status === 404) {
        return null;
      } else if (response.ok) {
        return URL.createObjectURL(await response.blob());
      } else {
        setError(response.statusText);
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      setError();
    }

    // fail safe
    return null;
  }, [group, setError, clearError]);

  useEffect((): void => {
    async function setCurrentLogo() {
      const currentLogo = await getGroupLogo();
      setLogo((l: LogoType): LogoType => ({ ...l, current: currentLogo }));
    }

    setCurrentLogo();
  }, [group, getGroupLogo]);

  /** helper function to delete the group logo, to be used in an `onClick` prop */
  async function deleteGroupLogo(e: React.SyntheticEvent): Promise<void> {
    e.preventDefault();
    clearError();

    // TODO: Ask for confirmation before deleting?
    setDeletionInProgress(true);

    try {
      const response = await fetch(`/groups/${group}/settings/logo`, {
        method: "DELETE",
      });
      response.ok
        ? setLogo({ ...logo, current: null })
        : setError(response.statusText);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      setError();
    }

    setDeletionInProgress(false);
  }

  /**
   * helper function to display a preview of a newly uploaded logo,
   * to be bound to an `onClick` prop
   */
  function previewImage(e: React.ChangeEvent<HTMLInputElement>): void {
    e.preventDefault();
    clearError();

    setLogo({ ...logo, new: e.target.files?.[0] || null });
  }

  /**
   * helper function to upload a new group logo, to be bound to an
   * `onClick` prop
   */
  async function uploadGroupLogo(e: React.SyntheticEvent): Promise<void> {
    e.preventDefault();
    clearError();

    setUploadInProgress(true);

    try {
      const response = await fetch(`/groups/${group}/settings/logo`, {
        method: "PUT",
        headers: {
          "Content-Type": "image/png",
        },
        body: logo.new,
      });

      response.ok
        ? setLogo({ new: null, current: await getGroupLogo() })
        : setError(response.statusText);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      setError();
    }

    setUploadInProgress(false);
  }

  return (
    <form className={styles.centeredForm}>
      {logo.current ? (
        <>
          <h4 className="centered">Current Logo</h4>
          <img
            className={styles.avatarImg}
            alt="group-logo"
            src={logo.current}
          />

          <button
            className={styles.inputButton}
            disabled={deletionInProgress || uploadInProgress}
            onClick={deleteGroupLogo}
          >
            {deletionInProgress
              ? "Deleting current logo..."
              : "Delete current logo"}
          </button>
        </>
      ) : (
        <h4 className="centered">No current logo</h4>
      )}

      <label className={styles.inputLabel}>
        Choose new logo
        <input
          type="file"
          style={{ display: "none" }}
          accept="image/png"
          onChange={previewImage}
        />
      </label>

      {logo.new ? (
        <>
          <MediumSpacer />
          <h4 className="centered">New logo preview</h4>

          <img
            className={styles.avatarImg}
            alt="group-logo-preview"
            src={URL.createObjectURL(logo.new)}
          />

          <button
            className={styles.inputButton}
            disabled={deletionInProgress || uploadInProgress}
            onClick={uploadGroupLogo}
          >
            {uploadInProgress ? "Uploading new logo..." : "Upload new logo"}
          </button>
        </>
      ) : null}
    </form>
  );
}

/**
 * A React Client Component to display and support the editing of the
 *  overview text for a provided `group`.
 */
function EditOverviewForm({
  group,
  setError,
  clearError,
}: {
  /** the name of the group to operate on */
  group: string;
  /** a helper function to set an <ErrorMessage> in the parent component */
  setError: (details?: string) => void;
  /** a helper function to clear an <ErrorMessage> in the parent component */
  clearError: () => void;
}): React.ReactElement {
  /** the group overview text */
  const [overview, setOverview] = useState<string>("");
  /** flag for whether we're actively uploading a new overview text */
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);
  /** flag for when the upload is completed */
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);

  /**
   * helper function to get the current group overview or the default
   * template if the current group doesn't yet have an overview,
   * wrapped in useCallback for caching
   */
  const getOverview: () => Promise<string> = useCallback(async () => {
    clearError();

    try {
      const response = await fetch(`/groups/${group}/settings/overview`);

      if (response.status === 404) {
        return OVERVIEW_TEMPLATE;
      } else if (response.ok) {
        const currentOverview = await response.text();
        return currentOverview.trim().length > 0
          ? currentOverview
          : OVERVIEW_TEMPLATE;
      }

      setError(response.statusText);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      setError();
    }

    // fail safe
    return OVERVIEW_TEMPLATE;
  }, [group, setError, clearError]);

  useEffect((): void => {
    async function setCurrentOverview(): Promise<void> {
      const currentOverview = await getOverview();
      setOverview(currentOverview);
    }

    setCurrentOverview();
  }, [group, getOverview]);

  /**
   * helper function to handle changes to the overview, intended to
   * be bound to an `onChange` prop
   */
  function changeOverview(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    e.preventDefault();
    clearError();

    if (uploadInProgress) {
      return;
    }
    if (uploadComplete) {
      setUploadComplete(false);
    }

    setOverview(e.target.value);
  }

  /**
   * helper function to upload a new overview text, to be bound to
   * the `onSubmit` prop of an HTML form
   */
  async function uploadOverview(e: React.SyntheticEvent): Promise<void> {
    e.preventDefault();
    clearError();
    setUploadInProgress(true);

    try {
      const response = await fetch(`/groups/${group}/settings/overview`, {
        method: "PUT",
        headers: {
          "Content-Type": "text/markdown",
        },
        body: overview,
      });

      if (response.ok) {
        setUploadComplete(true);
        setOverview(await getOverview());
      } else {
        setError(response.statusText);
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      setError();
    }

    setUploadInProgress(false);
  }

  return (
    <form
      className={styles.centeredForm}
      style={{ flexGrow: 3 }}
      onSubmit={uploadOverview}
    >
      <label htmlFor="edit-group-overview">
        <h4 className="centered">Overview</h4>
        <FocusParagraphCentered style={{ margin: 5 }}>
          See{" "}
          <a
            href="https://docs.nextstrain.org/page/guides/share/groups/customize.html"
            target="_blank"
            rel="noreferrer noopener"
          >
            Group customization docs
          </a>{" "}
          for details on how to format your overview.
        </FocusParagraphCentered>
      </label>

      <textarea
        className={styles.textArea}
        id="edit-group-overview"
        value={overview}
        onChange={changeOverview}
        disabled={uploadInProgress}
      />

      <button
        className={styles.inputButton}
        type="submit"
        disabled={uploadInProgress || uploadComplete}
      >
        {uploadInProgress
          ? "Uploading overview..."
          : uploadComplete
            ? "Overview successfully uploaded"
            : "Upload overview"}
      </button>
    </form>
  );
}
