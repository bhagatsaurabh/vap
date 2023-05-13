import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import styles from "./Accordion.module.css";

const Accordion = forwardRef(({ title, children, className }, ref) => {
  const [open, setOpen] = useState(false);
  const contentEl = useRef(null);
  const [height, setHeight] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setHeight(contentEl.current.scrollHeight);
  }, []);

  const handleClick = () => {
    if (!open) {
      setVisible(true);
    }
    setOpen(!open);
  };
  const handleEnd = () => {
    if (!open) {
      setVisible(false);
    }
  };

  useImperativeHandle(ref, () => ({
    open() {
      if (!open) handleClick();
    },
    close() {
      if (open) handleClick();
    },
  }));

  const classes = [styles.accordion];
  if (className) classes.push(className);
  if (open) classes.push(styles.open);

  return (
    <section className={classes.join(" ")}>
      <button onClick={handleClick} className={styles.header}>
        {title}
      </button>
      <div
        ref={contentEl}
        style={{ maxHeight: open ? `${height}px` : 0, visibility: visible ? "visible" : "hidden" }}
        className={styles.content}
        onTransitionEnd={handleEnd}
      >
        {children}
      </div>
    </section>
  );
});

export default Accordion;
