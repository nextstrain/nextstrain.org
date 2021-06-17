import React from "react";
import { parseMarkdown } from "../../util/parseMarkdown";

export default function MarkdownDisplay({ mdstring, ...props }) {
  let cleanDescription;
  try {
    cleanDescription = parseMarkdown(mdstring);
  } catch (error) {
    console.error(`Error parsing markdown: ${error}`);
    cleanDescription = '<p>There was an error parsing markdown content.</p>';
  }
  return (
    <div
      {...props}
      dangerouslySetInnerHTML={{ __html: cleanDescription }} // eslint-disable-line react/no-danger
    />
  );
}
