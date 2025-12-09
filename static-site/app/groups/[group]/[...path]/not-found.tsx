"use client";

import { usePathname } from "next/navigation";
import IndividualGroupPage from "../page";

export default function NotFound() {
  const [group, ...path] = usePathname().replace(/^\/groups\//, "").split("/");

  return (
    <IndividualGroupPage
      params={{ group: group as string }} // eslint-disable-line @typescript-eslint/consistent-type-assertions
      nonExistentPath={path.join("/")}
    />
  );
}
