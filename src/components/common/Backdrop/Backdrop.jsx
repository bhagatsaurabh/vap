import { CSSTransition } from "react-transition-group";

import { useRef } from "react";
import styles from "./Backdrop.module.css";

const Backdrop = ({ show, onDismiss, clear, layer }) => {
  const node = useRef(null);
  const classes = [styles.backdrop];
  const layerLevel = layer ?? 0;

  if (clear) classes.push(styles.clear);
  classes.push(styles[`layer${layerLevel}`]);

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
