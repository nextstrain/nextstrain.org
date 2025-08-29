import React from "react";

/**
 * A React Server Component that renders the 404 page, shown when a
 * non-existent URL is requested.
 */
export default function FourOhFour(): React.ReactElement {
  return (
    <div className="pageContent">
      <div className="errorContainer">
        Oops - that page doesn’t exist! (404).
        <br />
        Maybe start again with <a href="/">our main page</a>?
      </div>
    </div>
  );
}
