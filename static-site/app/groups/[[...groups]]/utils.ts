/**
 * A helper function that checks to see if the currently logged in
 * user can edit the settings of the provided `group`
 */
export async function canUserEditGroupSettings(
  /** the name of the group to check permissions of */
  group: string,
): Promise<boolean> {
  try {
    const groupOverviewOptions = await fetch(
      `/groups/${group}/settings/overview`,
      { method: "OPTIONS" },
    );

    if ([401, 403].includes(groupOverviewOptions.status)) {
      console.log(
        "You can ignore the console error above; it is used to determine whether the edit button is shown.",
      );
    }

    const allowedMethods = new Set(
      groupOverviewOptions.headers.get("Allow")?.split(/\s*,\s*/),
    );
    const editMethods = ["PUT", "DELETE"];

    return editMethods.every((method) => allowedMethods.has(method));
  } catch (err) {
    console.error(
      "Cannot check user permissions to edit group settings",
      err instanceof Error ? err.message : String(err),
    );
  }

  // fail closed
  return false;
}

/**
 * A helper function that checks to see if the currently logged in
 * user can view the members of the provided `group`
 */
export async function canViewGroupMembers(
  /** the name of the group to check permissions of */
  group: string,
): Promise<boolean> {
  try {
    const groupMemberOptions = await fetch(
      `/groups/${group}/settings/members`,
      { method: "OPTIONS" },
    );

    if ([401, 403].includes(groupMemberOptions.status)) {
      console.log(
        "You can ignore the console error above; it is used to determine whether the members can be shown.",
      );
    }

    const allowedMethods = new Set(
      groupMemberOptions.headers.get("Allow")?.split(/\s*,\s*/),
    );

    return allowedMethods.has("GET");
  } catch (err) {
    console.error(
      "Cannot check user permissions to view group members",
      err instanceof Error ? err.message : String(err),
    );
  }

  // fail closed
  return false;
}
