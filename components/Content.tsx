"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import styles from "./Content.module.css";

/* ------------------------------------------------------------------ *
 * Content
 *
 * The centred stack, pared to four breaths: a quiet status pill, the
 * "7." mark, a hairline with a slow light sweep, and one serif line.
 * Everything else is air.
 * ------------------------------------------------------------------ */

const EXPO_OUT = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: EXPO_OUT },
  },
};

export default function Content() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={styles.stack}
      variants={container}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      {/* Eyebrow: the mandatory status, worn like a lapel pin. */}
      <motion.div className={styles.eyebrow} variants={item}>
        <motion.span
          className={styles.status}
          animate={reduce ? undefined : { opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className={styles.eyebrowText}>Under maintenance</span>
      </motion.div>

      {/* The mark — black ink inverted to ivory, breathing softly. */}
      <motion.div className={styles.logoWrap} variants={item}>
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/Logo/Maggie Logo Transparent.png"
            alt="Maggie — the seven mark"
            width={900}
            height={900}
            priority
            className={styles.logo}
          />
        </motion.div>
      </motion.div>

      {/* Hairline divider with a slow light sweep. */}
      <motion.div className={styles.divider} variants={item}>
        {!reduce && (
          <motion.span
            className={styles.sweep}
            animate={{ x: ["-60%", "260%"] }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              repeatDelay: 3.6,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      {/* One line, in the serif voice. */}
      <motion.p className={styles.subcopy} variants={item}>
        Building something <em>worth staring at.</em>
      </motion.p>
    </motion.div>
  );
}
