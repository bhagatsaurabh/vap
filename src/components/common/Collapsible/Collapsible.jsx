import PropTypes from "prop-types";

import styles from "./Collapsible.module.css";

const Collapsible = ({ summary, children }) => {
  return (
    <details className={styles.collapsible}>
      <summary>{summary}</summary>
      <p>{children}</p>
    </details>
  );
};

Collapsible.propTypes = {
  summary: PropTypes.string,
  children: PropTypes.node,
};

export default Collapsible;
