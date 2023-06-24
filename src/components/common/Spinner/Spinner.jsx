import PropTypes from "prop-types";

import styles from "./Spinner.module.css";
import { spinner } from "@/assets/icons";

const Spinner = ({ size, accent, className, children }) => {
  const sAccent = styles[accent] ?? styles["dark"];
  const classes = [sAccent, styles["spinner"]];
  if (className) {
    classes.push(className);
  }

  return (
    <>
      <img
        src={spinner}
        style={{ width: `${size}rem` }}
        className={classes.join(" ")}
        alt="Spinner icon"
      />
      {children && (
        <h4 style={{ fontSize: `${size / 2}rem` }} className={styles["spinner-text"]}>
          {children}
        </h4>
      )}
    </>
  );
};

Spinner.propTypes = {
  size: PropTypes.number,
  accent: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Spinner;
