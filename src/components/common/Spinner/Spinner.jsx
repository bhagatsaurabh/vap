import styles from "./Spinner.module.css";
import { spinner } from "@/assets/icons";

const Spinner = ({ size, accent, className }) => {
  const sAccent = styles[accent] ?? styles["light"];
  const classes = [sAccent, styles["spinner"]];
  if (className) {
    classes.push(className);
  }

  return (
    <img
      src={spinner}
      style={{ width: `${size}rem` }}
      className={classes.join(" ")}
      alt="Spinner icon"
    />
  );
};

export default Spinner;
