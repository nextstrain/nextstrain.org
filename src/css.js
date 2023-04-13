import * as theme from './theme.js';


/* XXX TODO: One way to do theme vars, for example.  We also would probably
 * want to use Emotion¹ (i.e. via @emotion/server) or Fela² to help manage CSS,
 * styled components (used sparingly!), etc. and if so, then we might also use
 * Emotion/Fela's theme support.  (My preference here would be for Fela.)
 *   -trs, 13 April 2023
 *
 * ¹ <https://emotion.sh/docs/introduction>
 * ² <https://fela.js.org/docs/latest/guides/usage-with-react>
 */

export const toCssVars = (value, name) => {
  switch (typeof value) {
    case "object":
      return Object.entries(value)
        .map(([k, v]) => toCssVars(v, `${name}-${k}`))
        .join("\n");

    case "string":
    case "number":
      return `--${name}: ${value};`;

    default:
      throw new Error(`unknown typeof value: ${typeof value}`);
  }
};

export const themeCssVars = `
  :root {
    ${toCssVars(theme, "theme")}
  }
`;
