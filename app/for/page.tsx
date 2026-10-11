import { redirect } from "next/navigation";

// /for on its own: the general page for local businesses.
export default function ForIndex() {
  redirect("/for/local-business");
}
