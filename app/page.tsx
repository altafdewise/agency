import Backdrop from "@/components/Backdrop";
import Content from "@/components/Content";
import Frame from "@/components/Frame";
import Spotlight from "@/components/Spotlight";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <Backdrop />
      <Spotlight />
      <Content />
      <div className="vignette" />
      <Frame />
      <div className="grain" />
    </main>
  );
}
