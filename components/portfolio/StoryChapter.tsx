import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import styles from "./portfolio.module.css";

type StoryChapterProps = {
  id: string;
  index: string;
  label: string;
  className?: string;
  children: React.ReactNode;
};

/** Shared semantic shell for every chapter in the eventual nine-part story. */
export const StoryChapter = forwardRef<HTMLElement, StoryChapterProps>(
  function StoryChapter({ id, index, label, className, children }, ref) {
    return (
      <section
        ref={ref}
        id={id}
        aria-labelledby={`${id}-chapter-label`}
        className={cn(styles.chapter, className)}
        data-chapter={id}
      >
        <p id={`${id}-chapter-label`} className={styles.chapterLabel}>
          <span>{index}</span>
          <span>{label}</span>
        </p>
        {children}
      </section>
    );
  }
);
