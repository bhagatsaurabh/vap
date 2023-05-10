import { useState } from "react";

import styles from "./Library.module.css";

const Library = () => {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  const handleTransitionEnd = () => {
    if (open) setShow(false);
  };

  const classes = [styles.library];
  if (open) classes.push(styles.open);

  return (
    <aside onTransitionEnd={handleTransitionEnd} className={classes.join(" ")}>
      <button className={styles.control}>Library</button>
      {show && (
        <>
          <div className={styles.header}>
            <h1>Library</h1>
            <input type="text" placeholder="Search" />
          </div>
          <div className={styles.content}></div>
        </>
      )}
    </aside>
  );
};

export default Library;
