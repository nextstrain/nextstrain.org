import React, { useEffect, useState } from "react";
import * as splashStyles from "../splash/styles";
import { CenteredForm, InputButton, TextArea } from "./styles";

const OVERVIEW_TEMPLATE = `---
title:
byline:
website:
showDatasets:
showNarratives:
---

Add description of your group here.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOverview = async () => {
    clearErrorMessage();
    try {
      const response = await fetch(`/groups/${groupName}/settings/overview`);
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
      const response = await fetch(`/groups/${groupName}/settings/overview`, {
        method: "PUT",
        headers: {
          "Content-Type": "text/markdown"
        },
        body: overview
      });

      response.ok
        ? setUploadComplete(true)
        : createErrorMessage(response);
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
        <splashStyles.H4>Edit Overview:</splashStyles.H4>
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
