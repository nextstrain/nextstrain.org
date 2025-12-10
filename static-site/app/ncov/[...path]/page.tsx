import { notFound } from "next/navigation";
export { metadata } from "../../sars-cov-2/page";

// This should only be reached if the server's router (src/routing) does not
// find an existing resource at the path.
export default function Page(): void {
  notFound();
}
