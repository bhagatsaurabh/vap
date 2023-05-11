import { CSSTransition } from "react-transition-group";

import { useRef } from "react";
import styles from "./Backdrop.module.css";

const Backdrop = ({ show, onDismiss, clear }) => {
  const node = useRef(null);
  const classes = [styles.backdrop];

  if (clear) classes.push(styles.clear);

  return (
    <CSSTransition
      mountOnEnter
      unmountOnExit
      nodeRef={node}
      in={show}
      timeout={150}
      classNames={{ ...styles }}
    >
      <div onPointerUp={onDismiss} ref={node} className={classes.join(" ")}></div>
    </CSSTransition>
  );
};

export default Backdrop;
