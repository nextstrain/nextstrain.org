import React from "react";

export default function FourOhFour(): React.ReactElement {
  return (
    <>
      <div className="errorContainer">
        Oops - that page doesn’t exist! (404).
        <br />
        Maybe start again with <a href="/">our main page</a>?
      </div>
    </>
  );
}
