import Button from "../common/Button/Button";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer>
      <div className={styles.left}>
        <a href="https://github.com/saurabh-prosoft/vap" target="_blank" rel="noreferrer">
          <Button icon="github" />
        </a>
      </div>
      <div className={styles.right}>
        <span>Copyright &copy; 2018-present | </span>
        <span className="ws-no-wrap">Saurabh Bhagat</span>
      </div>
    </footer>
  );
};

export default Footer;
