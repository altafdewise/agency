"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./Frame.module.css";

/* ------------------------------------------------------------------ *
 * Frame
 *
 * The HUD pinned to the four corners — brand mark, live local time,
 * vintage and contact. It reads like the chrome of a camera viewfinder
 * and frames the stage without competing with it.
 * ------------------------------------------------------------------ */

function Clock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Render a fixed-width placeholder until mounted to avoid hydration drift. */
  return <span className={styles.clock}>{now ?? "--:--:--"}</span>;
}

export default function Frame() {
  return (
    <motion.header
      className={styles.frame}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.6, delay: 1.2, ease: "easeOut" }}
    >
      <div className={`${styles.corner} ${styles.tl}`}>
        <span className={styles.brand}>
          Maggie<span className={styles.reg}>®</span>
        </span>
        <span className={styles.sub}>Creative agency</span>
      </div>

      <div className={`${styles.corner} ${styles.tr}`}>
        <span className={styles.label}>Local time</span>
        <Clock />
      </div>

      <div className={`${styles.corner} ${styles.br}`}>
        <span className={styles.label}>Reach us</span>
        <a className={styles.mail} href="mailto:admin@maggie.agency">
          admin@maggie.agency
        </a>
      </div>
    </motion.header>
  );
}
