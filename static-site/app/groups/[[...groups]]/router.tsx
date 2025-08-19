"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
export default function GroupsPageRouter(): React.ReactElement {
  /** a string indicating which sub-page should be displayed */
  const [pageToShow, setPageToShow] = useState<GroupsPages>("");
  /**
   * the name of the individual group being processed, if we're
   * loading a `/groups/{:group}` URL
   */
  const [group, setGroup] = useState<string>("");

  // get the requested path, to be parsed in the `useEffect()` hook below
  const params = useParams();

  useEffect((): void => {
    async function parseRequestUrl(): Promise<void> {
      if (params && params["groups"]) {
        // I don't think `params["groups"]` will ever _NOT_ be an
        // array, but this guard makes the typechecker happy and
        // really isn't that what matters
        if (Array.isArray(params["groups"])) {
          const groupName = params["groups"][0];
          const extra = params["groups"].slice(1).join("/");

          if (!groupName) {
            throw new Error("didn't get a group name, shouldn't happen");
          }

          setGroup(groupName);

          switch (extra) {
            case "settings/members":
              setPageToShow("members");
              break;
            case "settings":
              setPageToShow("settings");
              break;
            default:
              setPageToShow("individual-group");
          }
        }
      } else {
        // no params = load groups listing page
        setPageToShow("listing");
      }
    }

    parseRequestUrl();
  }, [params]);

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
