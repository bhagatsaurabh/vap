import PropTypes from "prop-types";

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

Feature.propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
};

export default Feature;
