import styles from "./Toggle.module.css";

const Toggle = ({ checked, onChange }) => {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e)} />
      <span className={styles.slider}></span>
    </label>
  );
};

export default Toggle;
