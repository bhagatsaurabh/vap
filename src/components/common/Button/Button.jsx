import { flip, noop } from "@/misc/utils";
import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";
import styles from "./Button.module.css";

const Button = ({
  busy,
  disabled,
  onClick,
  icon,
  iconLeft,
  iconRight,
  size,
  accent,
  className,
  children,
  fit,
  flat,
}) => {
  const bSize = size || 1;
  const bAccent = styles[accent] ?? styles["dark"];
  const classes = [bAccent];
  if (className) classes.push(className);
  if (disabled) classes.push("disabled");
  if (fit) classes.push(styles.fit);
  if (flat) classes.push(styles.flat);

  let content = [];
  const iconClasses = ["va-text-bottom"];
  if (children) {
    content.push(children);
    iconClasses.push(iconLeft ? "mr-1" : "ml-1");
  }
  if (icon) {
    content.push(
      !busy ? (
        <Icon
          className={iconClasses.join(" ")}
          size={bSize}
          accent={accent ?? "dark"}
          name={icon}
        />
      ) : (
        <Spinner className={iconClasses.join(" ")} size={bSize} accent={accent ?? "dark"} />
      )
    );

    if (iconLeft && !iconRight) {
      content = flip(content);
    }
  }

  return (
    <button
      disabled={disabled}
      className={classes.join(" ")}
      style={{ fontSize: `${bSize}rem` }}
      onClick={!disabled ? onClick : noop}
    >
      {...content}
    </button>
  );
};

export default Button;
