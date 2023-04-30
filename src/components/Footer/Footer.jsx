import styles from "./Footer.module.css";

const Footer = ({ left, right, center, transparent, fixed }) => {
  const classes = [styles.footer];
  if (fixed) {
    classes.push(styles.fixed);
  }
  if (transparent) {
    classes.push(styles.transparent);
  }

  return (
    <footer className={classes.join(" ")}>
      <div className={styles.left}>{left}</div>
      <div className={styles.center}>{center}</div>
      <div className={styles.right}>{right}</div>
    </footer>
  );
};

export default Footer;
