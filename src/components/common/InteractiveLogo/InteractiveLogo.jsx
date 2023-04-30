import styles from "./InteractiveLogo.module.css";
import { logo } from "@/assets/icons";

const InteractiveLogo = () => {
  return (
    <div className={styles["interactive-logo"]}>
      <img src={logo} alt="vAP header logo" />
      <span className="ml-1">vAP</span>
    </div>
  );
};

export default InteractiveLogo;
