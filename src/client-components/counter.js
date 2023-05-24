import React, { useState } from 'react';
import { renderClientSide } from '../utils/renderClientSide.js';

/**
 * Write client-side code completely as you would expect -- import any
 * libraries as needed and use whichever react functionality you need.
 * At the end simply call `renderClientSide(X)` where X is the parent
 * component to be rendered.
 */
function Counter() {
  const [counter, setCounter] = useState(0);
  return (
    <div style={{backgroundColor: '#ffffd9'}}>
      {`This code is rendered client-side using a '<script type="module">' tag (and has a coloured background)`}
      <br/>
      <button type="button" onClick={() => setCounter(counter + 1)}>Increment</button>
      <button type="button" onClick={() => setCounter(counter - 1)}>Decrement</button>
      <p>
        Count: {counter}
      </p>
    </div>
  );
}

renderClientSide(Counter);
