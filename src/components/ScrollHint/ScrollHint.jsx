import { useState } from "react";

import { useAfterMount } from "@/misc/custom-hooks";
import styles from "./ScrollHint.module.css";

const ScrollHint = () => {
  const [scrolled, setScrolled] = useState(false);
  const classes = [styles.scrollhint];
  if (scrolled) {
    classes.push(styles.hide);
  }

  const listener = () => {
    setScrolled(true);
  };

  useAfterMount(
    () => {
      document.querySelector("main").addEventListener("scroll", listener, false);
    },
    () => {
      document.querySelector("main").removeEventListener("scroll", listener);
    }
  );

  return <div className={classes.join(" ")}></div>;
};

export default ScrollHint;
