// scope-css.mjs — confine a stylesheet to a single wrapper selector.
//
// This is the mechanical heart of the static-blog prototype: it takes Next's
// *global* CSS (app/styles/globals.css, bootstrap.css, browserCompatability.css
// — all of which style bare `html`/`body`/`*`/`a`/`p`/… ) and rewrites every
// rule so it can only ever match inside a `.site-chrome` wrapper. After this
// transform, `p { … }` becomes `.site-chrome p { … }`, `body { … }` becomes
// `.site-chrome { … }`, and so on — so dropping the whole of bootstrap onto a
// page can no longer touch anything outside the header/footer chrome.
//
// This is the same idea gazette already applies to its own shadow stylesheet
// (rewriting :root/html/body -> :host); here the wrapper is an ordinary element
// in the light DOM rather than a shadow host.
import postcss from "postcss";

/**
 * Rewrite one selector so it only matches within `wrapper`.
 *
 * - `:root`, `html`, `body`            -> the wrapper itself
 * - leading `html `/`body ` combinator -> wrapper + remainder
 * - everything else                    -> descendant of the wrapper
 */
function scopeSelector(selector, wrapper) {
  const sel = selector.trim();

  // Document-root selectors collapse onto the wrapper element itself: their
  // declarations (resets, custom properties, base font) should apply to the
  // chrome box and cascade to its descendants, exactly as they did to <html>.
  if (sel === ":root" || sel === "html" || sel === "body") {
    return wrapper;
  }

  // `html.foo` / `body.foo` / `html > x` — replace just the leading element.
  const leading = sel.match(/^(html|body)\b/);
  if (leading) {
    return wrapper + sel.slice(leading[0].length);
  }

  // Bare universal / pseudo-element resets become descendants of the wrapper.
  // (We deliberately don't also emit a rule for the wrapper box itself; a reset
  // not applying to the chrome's own outer box is immaterial.)
  return `${wrapper} ${sel}`;
}

/**
 * The embedding page's root font-size. Nextstrain's real site sets
 * `html { font-size: 62.5% }`, i.e. 1rem = 10px, and all of bootstrap/globals'
 * rem values are authored against that. In the static blog shell the document
 * root belongs to gazette (`html { font-size: 18px }`), so we cannot rely on a
 * 10px root. Instead we bake the site's 10px base into the chrome at build time
 * by converting every `rem` in the chrome CSS to an absolute px, making the
 * chrome independent of whatever root font-size gazette sets. 1rem -> 10px.
 */
const REM_PX = 10;

/** Convert all `<n>rem` tokens in a declaration value to absolute px. */
function remToPx(value) {
  return value.replace(/(-?\d*\.?\d+)rem\b/gi, (_m, n) => `${parseFloat(n) * REM_PX}px`);
}

/** A PostCSS plugin that scopes every style rule under `wrapper`.
 *
 * Uses a single `Once(root)` pass (walkRules + walkDecls) rather than per-node
 * `Rule`/`Declaration` visitors: the visitor API re-visits a node after it is
 * mutated, which would re-prefix an already-scoped selector
 * (`.site-chrome .site-chrome h2`). A one-time walk sidesteps that. Selectors
 * are rewritten first so the declaration pass can recognise the collapsed
 * wrapper rule (`html { font-size } -> .site-chrome { font-size }`). */
export function scopePlugin(wrapper = ".site-chrome") {
  return {
    postcssPlugin: "scope-under-wrapper",
    Once(root) {
      root.walkRules((rule) => {
        // Skip the step selectors inside @keyframes (`from`, `0%`, …) — they
        // are not document selectors and must not be prefixed.
        const parent = rule.parent;
        if (parent && parent.type === "atrule" && /keyframes$/i.test(parent.name)) {
          return;
        }
        rule.selectors = rule.selectors.map((s) => scopeSelector(s, wrapper));
      });

      root.walkDecls((decl) => {
        // Drop the root font-size rule once it has collapsed onto the wrapper
        // (`html { font-size: 62.5% }` -> `.site-chrome { font-size: 62.5% }`):
        // we've converted the chrome's rem to px, so a 62.5% base on the
        // wrapper would only wrongly shrink inherited/em text. Keep it off.
        if (
          decl.prop === "font-size" &&
          /%\s*$/.test(decl.value) &&
          decl.parent &&
          decl.parent.type === "rule" &&
          decl.parent.selector === wrapper
        ) {
          decl.remove();
          return;
        }
        if (/rem/i.test(decl.value)) {
          decl.value = remToPx(decl.value);
        }
      });
    },
  };
}
scopePlugin.postcss = true;

/** Scope a CSS string. Returns the rewritten CSS. */
export async function scopeCss(css, { wrapper = ".site-chrome", from } = {}) {
  const result = await postcss([scopePlugin(wrapper)]).process(css, {
    from,
    // These are hand-authored source stylesheets; no source map needed.
    map: false,
  });
  return result.css;
}
