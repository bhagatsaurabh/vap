import PropTypes from "prop-types";

import styles from "./ScrollHint.module.css";

const ScrollHint = ({ show }) => {
  const classes = [styles.scrollhint];
  if (!show) {
    classes.push(styles.hide);
  }

  return <div className={classes.join(" ")}></div>;
};

ScrollHint.propTypes = {
  show: PropTypes.bool,
};

export default ScrollHint;
