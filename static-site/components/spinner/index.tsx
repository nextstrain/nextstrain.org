/**
 * Copied from:
 * https://github.com/nextstrain/forecasts-viz/blob/7ad27fcd5d892e40e9c9f0be50e7454afe29f005/src/lib/components/Spinner.js
 * which was itself copied from Auspice:
 * https://github.com/nextstrain/auspice/blob/adc6df36c5c36e37fb504274657249a7a1fea0ac/src/components/framework/spinner.js
 * On each copy there were slight modifications
 * NOTE: See also the relevant CSS in the sibling file `spinner.module.css`
 */

import React from "react";

import styles from "./styles.module.css";

/** next.js surfaced from /static-site/public */
const nextstrainLogoPath = '/nextstrain-logo-small.png';

/**
 * React Server Component that displays a spinning Nextstrain logo.
 *
 * Use this when waiting for data to load or when other background
 * tasks have not yet completed.
 */
export default function Spinner(): React.ReactElement {
  return (
    <div className={styles.spinnerContainer}>
      <img className={styles.spinner} src={nextstrainLogoPath} alt="loading"/>
    </div>
  )
}
