import { useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";

const Header = ({ left, right, center, transparent, fixed, dynamic, reference }) => {
  const [shadow, setShadow] = useState(false);
  const headerEl = useRef(null);
  let classes = [styles.header];
  const observer = useRef(null);

  shadow && classes.push(styles.shadow);
  fixed && classes.push(styles.fixed);
  transparent && classes.push(styles.transparent);

  useEffect(() => {
    if (dynamic) {
      reference && observer.current?.observe(reference());
    } else {
      reference && observer.current?.unobserve(reference());
    }
  }, [dynamic]);

  useEffect(() => {
    observer.current = new IntersectionObserver(([entry]) => setShadow(!entry.isIntersecting), {
      root: null,
      threshold: 0,
    });

    return () => {
      observer.current?.disconnect();
    };
  }, []);

  return (
    <header ref={headerEl} className={classes.join(" ")}>
      <div className={styles.left}>{left}</div>
      <div className={styles.center}>{center}</div>
      <div className={styles.right}>{right}</div>
    </header>
  );
};

export default Header;
