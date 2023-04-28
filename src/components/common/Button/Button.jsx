import styles from "./Button.module.css";
import * as icons from "@/assets/icons";

const Button = ({ onClick, icon, children }) => {
  let content = children ?? <img src={icons[icon]} alt={`${icon}-icon`} />;

  return <button onClick={onClick}>{content}</button>;
};

export default Button;
