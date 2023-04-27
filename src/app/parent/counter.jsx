"use client";

import {useState} from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{backgroundColor: '#ffbf80'}}>
      {`This component is a client-side counter, using next.js' "use client" directive`}
      <p/>
      Count: {count}
      <button type="button" onClick={() => setCount(count - 1)}>
        -
      </button>
      <button type="button" onClick={() => setCount(count + 1)}>
        +
      </button>
    </div>
  );
}
