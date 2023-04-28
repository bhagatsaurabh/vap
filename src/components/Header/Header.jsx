import styles from "./Header.module.css";
import { logo } from "@/assets/icons";

const Header = () => {
  return (
    <header>
      <div className={styles.left}>
        <img src={logo} alt="vAP header logo" />
        <span className="ml-1">vAP</span>
      </div>
      <div className={styles.right}></div>
    </header>
  );
};

export default Header;
