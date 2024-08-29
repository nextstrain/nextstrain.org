import dynamic from 'next/dynamic'

import { KvNamespace } from "../../src/kv.js";

// GenericPage needs to be loaded client-side because NavBar uses Router; this
// means the whole page is rendered client-side, which is dumb and slow.  We
// really want SSR for this; it would appear faster and less janky.
const GenericPage = dynamic(() => import('../src/layouts/generic-page.jsx'), {ssr: false});

const kv = new KvNamespace("counter");

export async function getServerSideProps({params, req, res, query}) {
  const counter = await kv.get("counter") ?? 0;

  return { props: { counter } };
}

export default function Page({counter}) {
  return <GenericPage>
    The counter is at: {counter}.

    <form method="post">
      <label>
        Add <input type="number" name="n" defaultValue="1" /> to counter
      </label>
      <input type="submit" value="do it" />
      <input type="submit" value="reset counter" name="reset" />
    </form>
  </GenericPage>
}
