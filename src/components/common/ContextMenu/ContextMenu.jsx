import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import styles from "./ContextMenu.module.css";

const ContextMenu = ({ title, options, position, onSelect, onDismiss }) => {
  const el = useRef(null);
  const [visible, setVisible] = useState(false);
  const normPosition = useRef({ x: 0, y: 0 });

  const handleSelect = (option) => {
    onSelect(option);
    onDismiss();
  };

  const pointerDownListener = useCallback((e) => {
    if (e.target.offsetParent !== el.current) {
      onDismiss();
    }
  }, []);

  useEffect(() => {
    el.current?.focus();
    window.addEventListener("pointerdown", pointerDownListener);

    normPosition.current = { ...position };
    if (position.x + el.current.clientWidth > document.body.clientWidth) {
      normPosition.current.x = document.body.clientWidth - el.current.clientWidth;
    }
    if (position.y + el.current.clientHeight > document.body.clientHeight) {
      normPosition.current.y = document.body.clientHeight - el.current.clientHeight;
    }

    setVisible(true);

    return () => {
      window.removeEventListener("pointerdown", pointerDownListener);
    };
  }, []);

  return (
    <div
      ref={el}
      tabIndex={0}
      className={[styles.contextmenu, visible ? styles.visible : ""].join(" ")}
      style={{ left: normPosition.current.x, top: normPosition.current.y }}
    >
      <span className={styles.title}>{title}</span>
      {options.map((option) => (
        <button key={option} onClick={() => handleSelect(option)} className={styles.option}>
          {option}
        </button>
      ))}
    </div>
  );
};

ContextMenu.propTypes = {
  title: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  onSelect: PropTypes.func,
  onDismiss: PropTypes.func,
};

export default ContextMenu;
