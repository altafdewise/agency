import { Path } from "@/components/Path";

// PathProvider now lives in app/layout.tsx so flow state persists across
// navigation to /about, /blog, etc.
export default function Home() {
  return <Path />;
}
