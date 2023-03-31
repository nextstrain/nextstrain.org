import React, { useEffect, useState } from "react";
import * as splashStyles from "../components/splash/styles";
import { ErrorBanner } from "../components/splash/errorMessages";
import GenericPage from "../layouts/generic-page";
import { FlexGridRight, HugeSpacer, MediumSpacer } from "../layouts/generalComponents";

const UNAUTHORIZED_MESSAGE = `
  You must have the owners role within a group to edit group settings.
  If your permissions have changed recently, try logging out and logging back in.
`;

const EditGroupSettingsPage = ({ location, groupName }) => {
  const [ userAuthorized, setUserAuthorized ] = useState(true);

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

  return (
    <GenericPage location={location}>
      <FlexGridRight>
        <splashStyles.Button to={`/groups/${groupName}`}>
          Return to "{groupName}" Page
        </splashStyles.Button>
      </FlexGridRight>
      <MediumSpacer/>

      <splashStyles.H2>
        Editing "{groupName}" Group Settings
      </splashStyles.H2>
      <HugeSpacer/>

      {userAuthorized
        ? <p>Placeholder for editing forms.</p>
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
