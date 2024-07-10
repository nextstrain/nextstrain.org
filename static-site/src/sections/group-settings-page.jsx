import React, { useEffect, useState } from "react";
import { uri } from "../../../src/templateLiterals.js";
import * as splashStyles from "../components/splash/styles";
import { ErrorBanner } from "../components/errorMessages";
import GenericPage from "../layouts/generic-page";
import { FlexGrid, FlexGridRight, HugeSpacer, MediumSpacer } from "../layouts/generalComponents";
import EditLogoForm from "../components/Groups/edit-logo-form";
import EditOverviewForm from "../components/Groups/edit-overview-form";

const UNAUTHORIZED_MESSAGE = <>
  You must have the owners role within a group to edit group settings.<br/>
  If your permissions have changed recently, try <a href="/logout">logging out</a> and logging back in.<br/>
</>;

const EditGroupSettingsPage = ({ location, groupName }) => {
  const [ userAuthorized, setUserAuthorized ] = useState(null);
  const [ errorMessage, setErrorMessage ] = useState();

  useEffect(() => {
    const checkUserAuthz = async () => {
      if (!cleanUp) {
        setUserAuthorized(await canUserEditGroupSettings(groupName));
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
        <splashStyles.Button to={uri`/groups/${groupName}`}>
          Return to {`"${groupName}"`} Page
        </splashStyles.Button>
      </FlexGridRight>
      <MediumSpacer/>

      {errorMessage && <ErrorBanner title={errorMessage.title} contents={errorMessage.contents} />}

      <splashStyles.H2>
        Editing {`"${groupName}"`} Group Settings
      </splashStyles.H2>
      <HugeSpacer/>

      {userAuthorized === null
        ? <splashStyles.H4>Checking user role in group</splashStyles.H4>
        : userAuthorized
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
    const groupOverviewOptions = await fetch(uri`/groups/${groupName}/settings/overview`, { method: "OPTIONS" });
    if ([401, 403].includes(groupOverviewOptions.status)) {
      console.log("You can ignore the console error above; it is used to determine whether the edit button is shown.");
    }
    const allowedMethods = new Set(groupOverviewOptions.headers.get("Allow")?.split(/\s*,\s*/));
    const editMethods = ["PUT", "DELETE"];
    return editMethods.every((method) => allowedMethods.has(method));
  } catch (err) {
    console.error("Cannot check user permissions to edit group settings", err.message);
  }
};

export default EditGroupSettingsPage;
