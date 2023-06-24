import PropTypes from "prop-types";

import Button from "../Button/Button";
import styles from "./ScrollToTop.module.css";

const ScrollToTop = ({ anchor, show }) => {
  const classes = [styles["scroll-to-top"]];
  if (show) {
    classes.push(styles.show);
  }

  const handleClick = () => {
    anchor()?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  };

  return (
    <div className={classes.join(" ")}>
      <Button icon="top" accent="dark" onClick={handleClick} />
    </div>
  );
};

ScrollToTop.propTypes = {
  anchor: PropTypes.func,
  show: PropTypes.bool,
};
export default ScrollToTop;
