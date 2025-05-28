import { marked } from "marked";
import sanitizeHtml, { Attributes, IOptions, Tag } from "sanitize-html";

import { siteUrl } from "../../data/BaseConfig";

/**
 * Render a string of text formatted with Markdown into HTML
 */
export default async function parseMarkdown({
  mdString,
  inline = false,
  addHeadingAnchors = false,
  headingAnchorClass = undefined,
}: {
  /** the Markdown-formatted text to render */
  mdString: string

  /** inline or block? */
  inline?: boolean

  /** Should `<a>` tags be added to headings? */
  addHeadingAnchors?: boolean

  /** Class name for heading anchors (from page-specific CSS Module) */
  headingAnchorClass?: string
}): Promise<string> {
  if (addHeadingAnchors) {
    if (headingAnchorClass === undefined) {
      throw Error("parseMarkdown: headingAnchorClass must be defined when addHeadingAnchors is true.")
    }
    marked.use({
      renderer: {
        heading({ tokens, depth }) {
          const text = this.parser.parseInline(tokens);
          const anchor = text.toLowerCase().replace(/[^\w]+/g, '-');
          return `
            <h${depth}>
              <a name="${anchor}" class="${headingAnchorClass}" href="#${anchor}">#</a>
              ${text}
            </h${depth}>
          `;
        }
      }
    });
  }

  const rawDescription = inline
    ? await marked.parseInline(mdString)
    : await marked.parse(mdString);

  const sanitizerConfig: IOptions = {
    allowedTags,
    allowedAttributes: { "*": allowedAttributes },
    nonTextTags: ["style", "script", "textarea", "option"],
    transformTags: {
      a: transformA,
    },
  };

  const cleanDescription: string = sanitizeHtml(
    rawDescription,
    sanitizerConfig,
  );

  return cleanDescription;
}

/**
 * A function to add `target=_blank` and `rel="noreferrer nofollow"`
 * attributes to <a> tags that link to external destinations
 */
function transformA(
  /** the name of the tag being transformed (will always be `a`) */
  tagName: string,

  /** attributes of the tag being transformed */
  attribs: Attributes
): Tag {
  // small helper to keep things dry
  const _setAttribs: (attribs: Attributes) => void = (attribs) => {
    attribs.target = "_blank";
    attribs.rel = "noreferrer nofollow";
  };

  const href = attribs.href;
  if (href && !href.startsWith("#")) {
    const baseUrl = new URL(siteUrl);
    try { // sometimes the `href` isn't a valid URL…
      const linkUrl = new URL(href);
      if (linkUrl.hostname !== baseUrl.hostname) {
        _setAttribs(attribs);
      }
    } catch {
      _setAttribs(attribs);
    }
  }

  return { tagName, attribs };
}

// All of these tags may not be necessary, this list was adopted from https://github.com/nextstrain/auspice/blob/master/src/util/parseMarkdown.js
const allowedTags = ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'em', 'strong', 'del', 'ol', 'ul', 'li', 'a', 'img'];
allowedTags.push('#text', 'code', 'pre', 'hr', 'table', 'thead', 'tbody', 'th', 'tr', 'td', 'sub', 'sup');
// We want to support SVG elements, requiring the following tags (we exclude "foreignObject", "style" and "script")
allowedTags.push("svg", "altGlyph", "altGlyphDef", "altGlyphItem", "animate", "animateColor", "animateMotion", "animateTransform");
allowedTags.push("circle", "clipPath", "color-profile", "cursor", "defs", "desc", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer");
allowedTags.push("feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feFlood", "feFuncA");
allowedTags.push("feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset");
allowedTags.push("fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "font", "font-face");
allowedTags.push("font-face-format", "font-face-name", "font-face-src", "font-face-uri", "g", "glyph", "glyphRef");
allowedTags.push("hkern", "image", "line", "linearGradient", "marker", "mask", "metadata", "missing-glyph", "mpath", "path");
allowedTags.push("pattern", "polygon", "polyline", "radialGradient", "rect", "set", "stop", "switch", "symbol");
allowedTags.push("text", "textPath", "title", "tref", "tspan", "use", "view", "vkern");

const allowedAttributes = ['href', 'src', 'width', 'height', 'alt'];
/* "style" is not safe for untrusted code.¹ Styles should be defined through
 * parameterized CSS Module selectors if possible, otherwise globals.css.
 * ¹ https://stackoverflow.com/a/4547037/4410590
 */

// We add the following Attributes for SVG via https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
allowedAttributes.push("accent-height", "accumulate", "additive", "alignment-baseline", "allowReorder", "alphabetic", "amplitude", "arabic-form", "ascent", "attributeName", "attributeType", "autoReverse", "azimuth");
allowedAttributes.push("baseFrequency", "baseline-shift", "baseProfile", "bbox", "begin", "bias", "by");
allowedAttributes.push("calcMode", "cap-height", "class", "clip", "clipPathUnits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cursor", "cx", "cy");
allowedAttributes.push("d", "decelerate", "descent", "diffuseConstant", "direction", "display", "divisor", "dominant-baseline", "dur", "dx", "dy");
allowedAttributes.push("edgeMode", "elevation", "enable-background", "end", "exponent", "externalResourcesRequired");
allowedAttributes.push("fill", "fill-opacity", "fill-rule", "filter", "filterRes", "filterUnits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "format", "from", "fr", "fx", "fy");
allowedAttributes.push("g1", "g2", "glyph-name", "glyph-orientation-horizontal", "glyph-orientation-vertical", "glyphRef", "gradientTransform", "gradientUnits");
allowedAttributes.push("hanging", "height", "href", "hreflang", "horiz-adv-x", "horiz-origin-x");
allowedAttributes.push("id", "ideographic", "image-rendering", "in", "in2", "intercept");
allowedAttributes.push("k", "k1", "k2", "k3", "k4", "kernelMatrix", "kernelUnitLength", "kerning", "keyPoints", "keySplines", "keyTimes");
allowedAttributes.push("lang", "lengthAdjust", "letter-spacing", "lighting-color", "limitingConeAngle", "local");
allowedAttributes.push("marker-end", "marker-mid", "marker-start", "markerHeight", "markerUnits", "markerWidth", "mask", "maskContentUnits", "maskUnits", "mathematical", "max", "media", "method", "min", "mode");
allowedAttributes.push("name", "numOctaves");
allowedAttributes.push("offset", "opacity", "operator", "order", "orient", "orientation", "origin", "overflow", "overline-position", "overline-thickness");
allowedAttributes.push("panose-1", "paint-order", "path", "pathLength", "patternContentUnits", "patternTransform", "patternUnits", "ping", "pointer-events", "points", "pointsAtX", "pointsAtY", "pointsAtZ", "preserveAlpha", "preserveAspectRatio", "primitiveUnits");
allowedAttributes.push("r", "radius", "referrerPolicy", "refX", "refY", "rel", "rendering-intent", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "result", "rotate", "rx", "ry");
allowedAttributes.push("scale", "seed", "shape-rendering", "slope", "spacing", "specularConstant", "specularExponent", "speed", "spreadMethod", "startOffset", "stdDeviation", "stemh", "stemv", "stitchTiles", "stop-color", "stop-opacity", "strikethrough-position", "strikethrough-thickness", "string", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "surfaceScale", "systemLanguage");
allowedAttributes.push("tabindex", "tableValues", "target", "targetX", "targetY", "text-anchor", "text-decoration", "text-rendering", "textLength", "to", "transform", "type");
allowedAttributes.push("u1", "u2", "underline-position", "underline-thickness", "unicode", "unicode-bidi", "unicode-range", "units-per-em");
allowedAttributes.push("v-alphabetic", "v-hanging", "v-ideographic", "v-mathematical", "values", "vector-effect", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "viewBox", "viewTarget", "visibility");
allowedAttributes.push("width", "widths", "word-spacing", "writing-mode");
allowedAttributes.push("x", "x-height", "x1", "x2", "xChannelSelector");
allowedAttributes.push("y", "y1", "y2", "yChannelSelector");
allowedAttributes.push("z", "zoomAndPan");
