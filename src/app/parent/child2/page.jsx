import Link from 'next/link';

export default function Page() {

  return (
    <div>
      <h1>Child 2</h1>
      {`This is from ./app/parent/child2/page.jsx and is a server component (`}
      <a href="https://beta.nextjs.org/docs/rendering/server-and-client-components#client-components">next.js docs</a>
      {`)`}
      <p/>
      {`Note that in server components we can't use any (client-side) JS; for instance the following is _not_ allowed:`}
      <br/>
      <code>{`<button onClick={() => console.log("CLICK!")}>Click me</button>`}</code>
      <p/>
      <Link href="/parent">Next.js Link component to parent page</Link>
      <br/>
      <a href="/parent">HTML anchor to parent page</a>
      <p/>
      <p/>
      <Link href="/parent/child1">Next.js Link component to sibling page</Link>
      <br/>
      <a href="/parent/child1">HTML anchor to sibling page</a>
    </div>
  );
}
