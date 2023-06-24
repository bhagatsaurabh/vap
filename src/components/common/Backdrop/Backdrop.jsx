import { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import PropTypes from "prop-types";

import styles from "./Backdrop.module.css";

const Backdrop = ({ show, onDismiss, clear, layer, onDrop }) => {
  const node = useRef(null);
  const classes = [styles.backdrop];
  const layerLevel = layer ?? 0;

  if (clear) classes.push(styles.clear);
  classes.push(styles[`layer${layerLevel}`]);

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const pos = { x: e.clientX, y: e.clientY };
    onDrop?.(data, pos);
  };

  return (
    <CSSTransition
      mountOnEnter
      unmountOnExit
      nodeRef={node}
      in={show}
      timeout={150}
      classNames={{ ...styles }}
    >
      <div
        onPointerUp={onDismiss}
        ref={node}
        className={classes.join(" ")}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e)}
      ></div>
    </CSSTransition>
  );
};

Backdrop.propTypes = {
  show: PropTypes.bool,
  onDismiss: PropTypes.func,
  clear: PropTypes.bool,
  layer: PropTypes.number,
  onDrop: PropTypes.func,
};

export default Backdrop;
