import PropTypes from "prop-types";

import styles from "./Toggle.module.css";

const Toggle = ({ checked, onChange }) => {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e)} />
      <span className={styles.slider}></span>
    </label>
  );
};

Toggle.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};

export default Toggle;
