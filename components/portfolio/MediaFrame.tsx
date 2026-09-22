import { cn } from "@/lib/cn";
import styles from "./portfolio.module.css";

type MediaFrameProps = {
  label: string;
  index: string;
  ratio?: "portrait" | "landscape" | "square";
  tone?: "paper" | "ink" | "accent";
  className?: string;
  children?: React.ReactNode;
};

/** Replaceable media shell used until real photography and imagery arrive. */
export function MediaFrame({
  label,
  index,
  ratio = "landscape",
  tone = "paper",
  className,
  children,
}: MediaFrameProps) {
  return (
    <figure
      className={cn(styles.mediaFrame, className)}
      data-ratio={ratio}
      data-tone={tone}
    >
      <div className={styles.mediaCanvas}>
        {children ?? (
          <div className={styles.placeholderComposition} aria-hidden>
            <span className={styles.placeholderInitials}>MA</span>
            <span className={styles.placeholderLine} />
            <span className={styles.placeholderDot} />
          </div>
        )}
      </div>
      <figcaption className={styles.mediaCaption}>
        <span>{label}</span>
        <span>{index}</span>
      </figcaption>
    </figure>
  );
}
