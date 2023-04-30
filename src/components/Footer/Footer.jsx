import styles from "./Footer.module.css";

const Footer = ({ left, right, center }) => {
  return (
    <footer>
      <div className={styles.left}>{left}</div>
      <div className={styles.center}>{center}</div>
      <div className={styles.right}>{right}</div>
    </footer>
  );
};

export default Footer;
