// import Link from 'next/link';
import Link from 'next/link';
import {Counter} from "./counter.jsx";
import './styles.css';

export default function Page() {

  return (
    <div>
      <h1>Parent</h1>
      {`This is from ./app/parent/page.jsx and is a server component (`}
      <a href="https://beta.nextjs.org/docs/rendering/server-and-client-components#client-components">next.js docs</a>
      {`)`}
      <p/>
      <Counter/>
      <Link href="/parent/child1">Next.js Link component to child1 page</Link>
      <br/>
      <a href="/parent/child1">HTML anchor to child1 page</a>
    </div>
  );
}
