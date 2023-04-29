import styles from "./Header.module.css";

const Header = ({ left, right }) => {
  return (
    <header>
      <div className={styles.left}>{left}</div>
      <div className={styles.right}>{right}</div>
    </header>
  );
};

export default Header;
