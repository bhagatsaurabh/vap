import styles from "./Header.module.css";

const Header = ({ left, right, center }) => {
  return (
    <header>
      <div className={styles.left}>{left}</div>
      <div className={styles.center}>{center}</div>
      <div className={styles.right}>{right}</div>
    </header>
  );
};

export default Header;
