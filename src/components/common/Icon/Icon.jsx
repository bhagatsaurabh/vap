import styles from "./Icon.module.css";
import * as icons from "@/assets/icons";

const Icon = ({ size, accent, name, className, onClick, focusable }) => {
  const iSize = size || 1;
  const icon = icons[name] ?? icons["warning"];
  const iAccent = styles[accent] ?? styles["dark"];
  const classes = [styles["icon"], iAccent];
  if (className) {
    classes.push(className);
  }
  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  return (
    <img
      onClick={handleClick}
      style={{ width: `${iSize}rem` }}
      src={icon}
      className={classes.join(" ")}
      alt={`${name}-icon`}
      tabIndex={focusable ? 0 : null}
    />
  );
};

export default Icon;
