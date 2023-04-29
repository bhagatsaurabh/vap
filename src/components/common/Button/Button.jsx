import { flip } from "@/misc/utils";
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
}) => {
  const bSize = size || 1;
  const bAccent = styles[accent] ?? styles["light"];
  const classes = [bAccent];
  if (className) {
    classes.push(className);
  }
  if (disabled) {
    classes.push("disabled");
  }

  let content = [];
  const iconClasses = ["va-text-bottom"];
  if (children) {
    content.push(children);
    iconClasses.push(iconLeft ? "mr-1" : "ml-1");
  }
  content.push(
    !busy ? (
      <Icon className={iconClasses.join(" ")} size={bSize} accent={accent} name={icon} />
    ) : (
      <Spinner className={iconClasses.join(" ")} size={bSize} accent={accent} />
    )
  );

  if (iconLeft && !iconRight) {
    content = flip(content);
  }

  return (
    <button
      disabled={disabled}
      className={classes.join(" ")}
      style={{ fontSize: `${bSize}rem` }}
      onClick={onClick}
    >
      {...content}
    </button>
  );
};

export default Button;
