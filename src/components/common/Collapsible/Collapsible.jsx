import styles from "./Collapsible.module.css";

const Collapsible = ({ summary, children }) => {
  return (
    <details className={styles.collapsible}>
      <summary>{summary}</summary>
      <p>{children}</p>
    </details>
  );
};

export default Collapsible;
