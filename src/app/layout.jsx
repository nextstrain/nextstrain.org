import "./layout.scss";

import Nav from "./nav.jsx";


export const dynamic = "force-dynamic";


export const metadata = {
  title: {
    template: "%s — Nextstrain",
    absolute: "Nextstrain",
  },
  description: "Real-time tracking of pathogen evolution",
};


export default function RootLayout({ children }) {
  /* XXX TODO: There's a lot more we want here, obviously.  Global page
   * elements, styles, etc.
   *   -trs, 6 April 2023
   */

  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
