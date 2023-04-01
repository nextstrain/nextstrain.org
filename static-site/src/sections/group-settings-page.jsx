import React, { useEffect, useState } from "react";
import * as splashStyles from "../components/splash/styles";
import { ErrorBanner } from "../components/splash/errorMessages";
import GenericPage from "../layouts/generic-page";
import { FlexGrid, FlexGridRight, HugeSpacer, MediumSpacer } from "../layouts/generalComponents";
import EditLogoForm from "../components/Groups/edit-logo-form";
import EditOverviewForm from "../components/Groups/edit-overview-form";

const UNAUTHORIZED_MESSAGE = `
  You must have the owners role within a group to edit group settings.
  If your permissions have changed recently, try logging out and logging back in.
`;

const EditGroupSettingsPage = ({ location, groupName }) => {
  const [ userAuthorized, setUserAuthorized ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState();

  useEffect(() => {
    const checkUserAuthz = async () => {
      if (! await canUserEditGroupSettings(groupName) && !cleanUp){
        setUserAuthorized(false);
      }
    }
    let cleanUp = false;
    checkUserAuthz();
    return () => cleanUp = true;
  }, [groupName]);

  const createErrorMessage = (details) => {
    setErrorMessage({
      title: "An error occurred when trying to fetch or update group settings. Please try again.",
      contents: details ? `Error details: ${details}` : null
    });
  };

  const clearErrorMessage = () => {
    if (errorMessage) setErrorMessage(null);
  };

  return (
    <GenericPage location={location}>
      <FlexGridRight>
        <splashStyles.Button to={`/groups/${groupName}`}>
          Return to "{groupName}" Page
        </splashStyles.Button>
      </FlexGridRight>
      <MediumSpacer/>

      {errorMessage && <ErrorBanner title={errorMessage.title} contents={errorMessage.contents} />}

      <splashStyles.H2>
        Editing "{groupName}" Group Settings
      </splashStyles.H2>
      <HugeSpacer/>

      {userAuthorized
        ? <FlexGrid style={{ minHeight: "500px" }}>
            <EditLogoForm
              groupName={groupName}
              createErrorMessage={createErrorMessage}
              clearErrorMessage={clearErrorMessage}/>
            <EditOverviewForm
              groupName={groupName}
              createErrorMessage={createErrorMessage}
              clearErrorMessage={clearErrorMessage}/>
          </FlexGrid>
        : <ErrorBanner title={UNAUTHORIZED_MESSAGE}/>}
    </GenericPage>
  )
};

export const canUserEditGroupSettings = async (groupName) => {
  try {
    const groupOverviewOptions = await fetch(`/groups/${groupName}/settings/overview`, { method: "OPTIONS" });
    const allowedMethods = new Set(groupOverviewOptions.headers.get("Allow")?.split(/\s*,\s*/));
    const editMethods = ["PUT", "DELETE"];
    return editMethods.every((method) => allowedMethods.has(method));
  } catch (err) {
    console.error("Cannot check user permissions to edit group settings", err.message);
  }
};

export default EditGroupSettingsPage;
