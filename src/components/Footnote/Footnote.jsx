import styles from "./Footnote.module.css";

const Footnote = () => {
  return (
    <div className={styles.footnote}>
      <span>Copyright &copy; 2018-present | </span>
      <span className="ws-no-wrap">Saurabh Bhagat</span>
    </div>
  );
};

export default Footnote;
