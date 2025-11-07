/*
This function is copied without modification from
https://observablehq.com/@d3/beeswarm/2

ISC License
Copyright 2018–2023 Observable, Inc.
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

/* eslint-disable */

export function dodge(data, {radius = 1, x = d => d} = {}) {
  const radius2 = radius ** 2;
  const circles = data.map((d, i, data) => ({x: +x(d, i, data), data: d})).sort((a, b) => a.x - b.x);
  const epsilon = 1e-3;
  let head = null, tail = null;

  // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
  function intersects(x, y) {
    let a = head;
    while (a) {
      if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
        return true;
      }
      a = a.next;
    }
    return false;
  }

  // Place each circle sequentially.
  for (const b of circles) {

    // Remove circles from the queue that can’t intersect the new circle b.
    while (head && head.x < b.x - radius2) head = head.next;

    // Choose the minimum non-intersecting tangent.
    if (intersects(b.x, b.y = 0)) {
      let a = head;
      b.y = Infinity;
      do {
        let y = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);
        if (y < b.y && !intersects(b.x, y)) b.y = y;
        a = a.next;
      } while (a);
    }

    // Add b to the queue.
    b.next = null;
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }

  return circles;
}
