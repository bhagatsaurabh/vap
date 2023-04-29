import styles from "./Feature.module.css";

const Feature = ({ left, right }) => {
  return (
    <div className={styles.feature}>
      {left}
      <div className={styles.divider}></div>
      {right}
    </div>
  );
};

export default Feature;
