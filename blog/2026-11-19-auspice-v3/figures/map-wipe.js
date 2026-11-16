// Image "wipe" comparison island.
// Shows two same-size images stacked; a draggable handle wipes between them.
// The two image paths come from the figure's `opts` (`lhs`, `rhs`) so this
// component is reusable across figures, e.g.:
//
//   ```yaml gazette
//   component: map-wipe.js
//   opts:
//     lhs: figures/map_h3n2_v2.png   # fully visible at the left edge
//     rhs: figures/map_h3n2_v3.png   # revealed to the right
//   ```
//
// Paths resolve document-relative, the same way gazette resolves a static
// figure's `image:` — i.e. under `figures/`.

// Handle grip tuning — tweak these to taste.
const HANDLE_SIZE = 2.5; // triangle size multiplier (1 = base size)
const HANDLE_SPACING = 15; // px from the dividing line to the inner edge of each arrow

export function render(mount, _data, { width, lhs, rhs } = {}) {
  if (!lhs || !rhs) {
    throw new Error("map-wipe.js: figure `opts` must set both `lhs` and `rhs` image paths");
  }
  const box = document.createElement("div");
  box.style.cssText =
    "position:relative;width:100%;line-height:0;cursor:ew-resize;overflow:hidden;user-select:none;touch-action:none";

  // Underlay = rhs; overlay = lhs, clipped from the right.
  const under = document.createElement("img");
  const over = document.createElement("img");
  under.src = rhs;
  over.src = lhs;
  for (const img of [under, over]) {
    img.draggable = false;
    img.style.cssText = "width:100%;height:auto;display:block;pointer-events:none";
  }
  over.style.cssText += ";position:absolute;inset:0;clip-path:inset(0 50% 0 0)";

  // Handle: black vertical line + arrow grip (styling is deliberately minimal).
  const handle = document.createElement("div");
  handle.style.cssText =
    "position:absolute;top:0;bottom:0;left:50%;width:3px;margin-left:-2.5px;" +
    "background:#000;box-shadow:0 0 0px rgba(0,0,0,0.5);pointer-events:none";
  // Arrow geometry, in px. SIZE scales the triangle; SPACING offsets each arrow
  // from the centre line. viewBox is 1:1 with px so both read in real pixels.
  const len = 6 * HANDLE_SIZE; // arrow horizontal length (base → tip)
  const half = 6 * HANDLE_SIZE; // arrow vertical half-height
  const base = HANDLE_SPACING; // inner edge
  const tip = base + len;
  const extent = Math.ceil(tip + 2); // viewBox half-size, +pad for the stroke
  // Left arrow ("<") then right arrow (">"), each pointing outward.
  const d =
    `M ${-base} ${-half} L ${-tip} 0 L ${-base} ${half} M ${-base} ${-half} L ${-base} ${half} ` +
    `M ${base} ${-half} L ${tip} 0 L ${base} ${half} M ${base} ${-half} L ${base} ${half}`;
  const grip = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  grip.setAttribute("viewBox", `${-extent} ${-extent} ${2 * extent} ${2 * extent}`);
  grip.setAttribute("width", String(2 * extent));
  grip.setAttribute("height", String(2 * extent));
  grip.style.cssText = `position:absolute;top:50%;left:50%;margin:${-extent}px;overflow:visible`;
  grip.innerHTML =
    `<path stroke="#000" d="${d}" stroke-width="1" fill="#000" vector-effect="non-scaling-stroke"></path>`;
  handle.appendChild(grip);

  box.append(under, over, handle);
  mount.replaceChildren(box);

  let pct = 50;
  const apply = () => {
    over.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = `${pct}%`;
  };
  const moveTo = (clientX) => {
    const r = box.getBoundingClientRect();
    pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    apply();
  };

  // Drag the handle (pointer capture => keeps tracking outside the box, and
  // works for mouse + touch). For hover-follow instead, drop the down/up guard
  // and move on every `pointermove`.
  let dragging = false;
  box.addEventListener("pointerdown", (e) => {
    dragging = true;
    box.setPointerCapture(e.pointerId);
    moveTo(e.clientX);
  });
  box.addEventListener("pointermove", (e) => {
    if (dragging) moveTo(e.clientX);
  });
  const stop = (e) => {
    dragging = false;
    if (box.hasPointerCapture?.(e.pointerId)) box.releasePointerCapture(e.pointerId);
  };
  box.addEventListener("pointerup", stop);
  box.addEventListener("pointercancel", stop);

  apply();

  return {
    // Width:100% + percentage units => geometry is self-correcting; nothing to do.
    resize() {},
    // Allow prose :trigger to set the wipe position, e.g. update="75".
    update(arg) {
      const n = Number(arg);
      if (!Number.isNaN(n)) {
        pct = Math.min(100, Math.max(0, n));
        apply();
      }
    },
  };
}
