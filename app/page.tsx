import { PathProvider } from "@/components/PathProvider";
import { Path } from "@/components/Path";

export default function Home() {
  return (
    <PathProvider>
      <Path />
    </PathProvider>
  );
}
