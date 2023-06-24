import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import PropTypes from "prop-types";

import Backdrop from "../Backdrop/Backdrop";
import styles from "./Modal.module.css";
import Button from "../Button/Button";
import { Constants, fullUrl, getSlug, trapBetween } from "@/misc/utils";

const Modal = forwardRef(
  (
    { title, titleExtras, children, onDismiss, onAction, controls, className, overflow, layer },
    ref
  ) => {
    const layerLevel = layer ?? 0;
    const pControls = controls ?? [];

    const [_show, set_Show] = useState(false);
    const [queuedAction, setQueuedAction] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const action = useNavigationType();
    const location = useLocation();
    const node = useRef(null);
    const bound = useRef(null);

    const trapFocus = useCallback((event) => {
      if (event.key === "Tab" || event.keyCode === Constants.KEYCODE_TAB) {
        if (!node.current.contains(document.activeElement)) {
          bound.current.first?.focus();
          return;
        }
        if (event.shiftKey) {
          if (document.activeElement === bound.current.first) {
            bound.current.last.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === bound.current.last) {
            bound.current.first.focus();
            event.preventDefault();
          }
        }
      }
    }, []);
    useEffect(() => {
      if (location.hash && history.state.idx === 0) {
        const path = location.pathname;
        navigate(path.substring(0, path.indexOf("#")), { replace: true });
      }
      const slug = getSlug(title);
      dispatch({ type: "navigation/set-prev", payload: fullUrl(location) });
      dispatch({ type: "navigation/set-modal", payload: `${location.pathname}${slug}` });
      navigate(slug, { state: { popUp: true } });
      document.activeElement?.blur();
      bound.current = trapBetween(node.current);
      window.addEventListener("keydown", trapFocus);

      set_Show(true);

      return () => {
        dispatch({ type: "navigation/clear-modal" });
      };
    }, []);
    useEffect(() => {
      if (_show && action === "POP") {
        window.removeEventListener("keydown", trapFocus);
        set_Show(false);
      }
    }, [location]);

    const handleDismiss = () => {
      if (_show) {
        window.removeEventListener("keydown", trapFocus);
        set_Show(false);
        dispatch({ type: "navigation/set-prev", payload: `${location.pathname}${getSlug(title)}` });
        navigate(-1);
      }
    };
    const handleAction = (text) => {
      if (queuedAction === null) {
        setQueuedAction(text);
        handleDismiss();
      }
    };
    const handleExited = () => {
      queuedAction && onAction(queuedAction);
      onDismiss();
    };

    useImperativeHandle(ref, () => ({
      close() {
        handleDismiss();
      },
    }));

    return (
      <>
        <Backdrop show={_show} onDismiss={handleDismiss} layer={layerLevel} />
        <CSSTransition
          onExited={handleExited}
          mountOnEnter
          unmountOnExit
          nodeRef={node}
          in={_show}
          timeout={150}
          classNames={{ ...styles }}
        >
          <div
            ref={node}
            role="dialog"
            className={[styles.modal, styles[`layer${layerLevel}`], className ?? ""].join(" ")}
          >
            <section className={styles.title}>
              <h2>{title}</h2>
              <div className={styles.right}>
                {titleExtras}
                <Button
                  className="fs-0"
                  accent="dark"
                  icon="close"
                  iconLeft
                  fit
                  onClick={handleDismiss}
                  size={1.5}
                />
              </div>
            </section>
            <section className={styles.content}>
              <div className={[styles.desc, overflow ? styles.shadow : ""].join(" ")}>
                {children}
              </div>
              <div className={styles.controls}>
                {pControls.map((text) => (
                  <Button key={text} accent="dark" size={1} onClick={() => handleAction(text)}>
                    {text}
                  </Button>
                ))}
              </div>
            </section>
          </div>
        </CSSTransition>
      </>
    );
  }
);

Modal.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  onDismiss: PropTypes.func,
  onAction: PropTypes.func,
  controls: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  overflow: PropTypes.bool,
  layer: PropTypes.number,
};
export default Modal;
