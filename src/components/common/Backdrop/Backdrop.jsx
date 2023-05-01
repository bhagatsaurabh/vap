import { CSSTransition } from "react-transition-group";

import { useRef } from "react";
import styles from "./Backdrop.module.css";

const Backdrop = ({ show, onDismiss }) => {
  const node = useRef(null);

  return (
    <CSSTransition
      mountOnEnter
      unmountOnExit
      nodeRef={node}
      in={show}
      timeout={150}
      classNames={{ ...styles }}
    >
      <div onPointerUp={onDismiss} ref={node} className={styles.backdrop}></div>
    </CSSTransition>
  );
};

export default Backdrop;
