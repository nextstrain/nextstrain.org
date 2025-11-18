import React from "react";

import { HugeSpacer } from "../../../components/spacers";
import Spinner from "../../../components/spinner";

import GroupListingPage from "./group-listing-page";
import GroupMembersPage from "./group-members-page";
import GroupSettingsPage from "./group-settings-page";
import IndividualGroupPage from "./individual-group-page";

type GroupsPages = "listing" | "members" | "settings" | "individual-group" | "";

/**
 * A React Client Component to handle routing/rendering for/of
 * `/groups` and other URLs under that namespace.
 *
 * This component serves a variety of requests, in a few different ways.
 *
 * - Requests for `/groups` -> display <GroupsListing>
 * - Requests for `/groups/:group` where `:group` is _NOT_ a valid
 *   group -> display <ErrorMessage> that group doesn't exist
 * - Requests for `/groups/:group` where `:group` is a valid group ->
 *   display <IndividualGroupPage> for that group
 * - Requests for `/groups/:group/settings` where `:group` is a valid
 *   group and user has permissions -> display <GroupSettingsPage> for
 *   the group
 * - Requests for `/groups/:group/settings` where `:group` is a valid
 *   group and user does not have permissions -> display
 *   <ErrorMessage>
 * - Requests for `/groups/:group/settings/members` where `:group` is
 *   a valid group and user has permissions -> display
 *   <GroupMembersPage>
 * - Requests for `/groups/:group/settings/members` where `:group` is
 *   a valid group and user does not have permissions -> display
 *   <ErrorMessage>
 */
export default function GroupsPageRouter({ groupsParam }: { groupsParam?: string[] }): React.ReactElement {
  /** a string indicating which sub-page should be displayed */
  let pageToShow: GroupsPages = "";
  let group = "";
  
  if (groupsParam) {
    group = groupsParam[0] || "";
    const extra = groupsParam.slice(1).join("/");

    if (!group) {
      throw new Error("didn't get a group name, shouldn't happen");
    }

    switch (extra) {
      case "settings/members":
        pageToShow = "members"
        break;
      case "settings":
        pageToShow = "settings"
        break;
      default:
        pageToShow = "individual-group"
    }
  } else {
    // no params = load groups listing page
    pageToShow = "listing"
  }

  switch (pageToShow) {
    case "listing":
      return <GroupListingPage />;

    case "individual-group":
      return <IndividualGroupPage group={group} />;

    case "members":
      return <GroupMembersPage group={group} />;

    case "settings":
      return <GroupSettingsPage group={group} />;

    case "":
      return <><HugeSpacer /><Spinner /></>;
  }
}
