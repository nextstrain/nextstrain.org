import React, { useEffect, useState } from "react";
import { uri } from "../../../../src/templateLiterals.js";
import * as splashStyles from "../splash/styles";
import { CenteredForm, InputButton, TextArea } from "./styles";

const OVERVIEW_TEMPLATE = `---
title:
byline:
website:
showDatasets:
showNarratives:
---

<!-- Replace this line with a description of your group. -->
`;

const EditOverviewForm = ({ groupName, createErrorMessage, clearErrorMessage }) => {
  const [ overview, setOverview ] = useState();
  const [ uploadInProgress, setUploadInProgress ] = useState(false);
  const [ uploadComplete, setUploadComplete ] = useState(false);

  useEffect(() => {
    const setCurrentOverview = async () => {
      const currentOverview = await getOverview();
      if (!cleanUp) setOverview(currentOverview);
    }

    let cleanUp = false;
    setCurrentOverview();
    return () => cleanUp = true;
  }, []);

  const getOverview = async () => {
    clearErrorMessage();
    try {
      const response = await fetch(uri`/groups/${groupName}/settings/overview`);
      if (response.status === 404) return OVERVIEW_TEMPLATE;
      if (response.ok) {
        const currentOverview = await response.text();
        return currentOverview.trim().length > 0
          ? currentOverview
          : OVERVIEW_TEMPLATE;
      }
      createErrorMessage(response);
    } catch (err) {
      console.error(err.message)
      createErrorMessage();
    }
  }

  const uploadOverview = async (e) => {
    e.preventDefault();
    clearErrorMessage();
    setUploadInProgress(true);

    try {
      const response = await fetch(uri`/groups/${groupName}/settings/overview`, {
        method: "PUT",
        headers: {
          "Content-Type": "text/markdown"
        },
        body: overview
      });

      if (response.ok) {
        setUploadComplete(true)
        setOverview(await getOverview());
      } else {
        createErrorMessage(response);
      }
    } catch (err) {
      console.error(err.message);
      createErrorMessage();
    }

    setUploadInProgress(false);
  }

  const changeOverview = (e) => {
    e.preventDefault();
    clearErrorMessage();
    if (uploadInProgress) return;
    if (uploadComplete) setUploadComplete(false);

    setOverview(e.target.value);
  }

  return (
    <CenteredForm style={{ flexGrow: 3 }} onSubmit={uploadOverview}>
      <label htmlFor="edit-group-overview">
        <splashStyles.H4>Overview</splashStyles.H4>
        <splashStyles.CenteredFocusParagraph style={{ margin: 5 }}>
          See <a href="https://docs.nextstrain.org/page/guides/share/groups/customize.html" target="_blank" rel="noreferrer noopener">Group customization docs</a>{' '}
          for details on how to format your overview.
        </splashStyles.CenteredFocusParagraph>
      </label>
      <TextArea
        id="edit-group-overview"
        value={overview}
        onChange={changeOverview}
        disabled={uploadInProgress}
      />
      <InputButton
        type="submit"
        disabled={uploadInProgress || uploadComplete}>
        {uploadInProgress
          ? "Uploading overview..."
          : uploadComplete
            ? "Overview successfully uploaded"
            : "Upload overview"}
      </InputButton>
    </CenteredForm>
  );
}

export default EditOverviewForm;
