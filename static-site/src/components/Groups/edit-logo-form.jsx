import React, { useEffect, useRef, useState } from "react";
import { MediumSpacer } from "../../layouts/generalComponents";
import * as splashStyles from "../splash/styles";
import { AvatarWithoutMargins, CenteredForm, InputButton } from "./styles";


const EditLogoForm = ({ groupName, createErrorMessage, clearErrorMessage }) => {
  const [ logo, setLogo ] = useState({ current: null, new: null });
  const [ deletionInProgress, setDeletionInProgress ] = useState(false);
  const [ uploadInProgress, setUploadInProgress ] = useState(false);
  // Ref to allow us to create click event for hidden file input
  const fileInput = useRef(null);

  useEffect(() => {
    const setCurrentLogo = async () => {
      const currentLogo = await getGroupLogo();
      if (!cleanUp) setLogo({ ...logo, current: currentLogo });
    }

    let cleanUp = false;
    setCurrentLogo();
    return () => cleanUp = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getGroupLogo = async () => {
    clearErrorMessage();
    try {
      const response = await fetch(`/groups/${groupName}/settings/logo`);
      if (response.status === 404) return null;
      if (response.ok) return URL.createObjectURL(await response.blob());
      createErrorMessage(response.statusText);
    } catch (err) {
      console.error(err.message)
      createErrorMessage();
    }
  }

  const deleteGroupLogo = async (e) => {
    e.preventDefault();
    clearErrorMessage();
    // TODO: Ask for confirmation before deleting?
    setDeletionInProgress(true);

    try {
      const response = await fetch(`/groups/${groupName}/settings/logo`, {method: "DELETE"});
      response.ok
        ? setLogo({ ...logo, current: null })
        : createErrorMessage(response.statusText);
    } catch (err) {
      console.error(err.message);
      createErrorMessage()
    }

    setDeletionInProgress(false);
  }

  const uploadGroupLogo = async (e) => {
    e.preventDefault();
    clearErrorMessage();
    setUploadInProgress(true);

    try {
      const response = await fetch(`/groups/${groupName}/settings/logo`, {
        method: "PUT",
        headers: {
          "Content-Type": "image/png"
        },
        body: logo.new
      });
      response.ok
        ? setLogo({ new: null, current: await getGroupLogo() })
        : createErrorMessage(response.statusText);
    } catch (err) {
      console.error(err.message);
      createErrorMessage();
    }

    setUploadInProgress(false);
  }

  const handleUploadButton = (e) => {
    e.preventDefault();
    clearErrorMessage();
    fileInput.current.click();
  }

  const previewImage = (e) => {
    e.preventDefault();
    clearErrorMessage();
    setLogo({ ...logo, new: e.target.files[0] });
  }

  return (
    <CenteredForm>
      {logo.current
        ? <>
            <splashStyles.H4>Current logo</splashStyles.H4>
            <AvatarWithoutMargins alt="group-logo" src={logo.current}/>
            <InputButton
              disabled={deletionInProgress || uploadInProgress}
              onClick={deleteGroupLogo}>
              {deletionInProgress
                ? "Deleting current logo..."
                : "Delete current logo"
              }
            </InputButton>
          </>
        : <splashStyles.H4>No current logo</splashStyles.H4>
      }

      {/* Hide the file input to allow for custom text in button */}
      <InputButton onClick={handleUploadButton}>
        Choose new logo
      </InputButton>
      <input type="file" ref={fileInput} style={{ display: "none" }} accept="image/png" onChange={previewImage}/>

      {logo.new
        ? <>
            <MediumSpacer/>
            <splashStyles.H4>New logo preview</splashStyles.H4>
            <AvatarWithoutMargins alt="group-logo-preview" src={URL.createObjectURL(logo.new)}/>
            <InputButton
              disabled={deletionInProgress || uploadInProgress}
              onClick={uploadGroupLogo}>
              {uploadInProgress
                ? "Uploading new logo..."
                : "Upload new logo"
              }
            </InputButton>
          </>
        : null
      }
    </CenteredForm>
  );
};

export default EditLogoForm;
