import styles from "./Tabs.module.css";

const Tabs = ({ headers, active, children, onChange }) => {
  return (
    <div className={styles.tabs}>
      <div className={styles.headers}>
        {headers.map((header) => (
          <button
            onClick={() => onChange(header)}
            className={[active === header ? styles.active : ""].join(" ")}
            key={header}
          >
            {header}
          </button>
        ))}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Tabs;
