import { useSelector } from "react-redux";

import styles from "./Brand.module.css";
import vapLight from "@/assets/images/logo-light-transparent.png";

const Brand = ({ size, fixed, editor, className }) => {
  let bSize = size;

  if (!fixed) {
    const media = useSelector((state) => state.media.value);
    if (media === "tab") {
      bSize = (2 / 3) * bSize;
    } else if (media === "mobile") {
      bSize = (1 / 2) * bSize;
    }
  }

  const classes = [styles.brand];
  className && classes.push(className);
  editor && classes.push(styles.editor);

  return (
    <div className={classes.join(" ")}>
      <img style={{ width: `${bSize}rem` }} src={vapLight} alt="vAP Logo" />
      <span style={{ fontSize: `${bSize}rem` }}>vAP</span>
    </div>
  );
};

export default Brand;
