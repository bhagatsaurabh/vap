import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { CSSTransition } from "react-transition-group";

import Backdrop from "../Backdrop/Backdrop";
import styles from "./Modal.module.css";
import Button from "../Button/Button";
import { Constants, trapBetween } from "@/misc/utils";

const Modal = ({ show, title, children, onDismiss, onAction, controls }) => {
  const pControls = controls ?? [];
  const navigate = useNavigate();
  const location = useLocation();
  const node = useRef(null);
  const action = useNavigationType();
  const bound = useRef(null);

  const handleDismiss = () => {
    if (show) {
      navigate(-1);
      onDismiss();
    }
  };
  const handleAction = (text) => {
    onAction(text);
    handleDismiss();
  };

  const trapFocus = useCallback((event) => {
    // if (!show) window.removeEventListener("keydown", trapFocus);

    if (!node.current.contains(document.activeElement)) {
      bound.current.first.focus();
      event.preventDefault();
      return;
    }

    if (event.key === "Tab" || event.keyCode === Constants.KEYCODE_TAB) {
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
    if (show) {
      if (!location.hash || (location.hash && action === "POP")) {
        onDismiss();
      }
    }
  }, [location]);

  useEffect(() => {
    if (show) {
      document.activeElement?.blur();
      bound.current = trapBetween(node.current);
      window.addEventListener("keydown", trapFocus);
    } else {
      window.removeEventListener("keydown", trapFocus);
    }

    if (show && location.hash !== `#pop-${title.toLowerCase().replace(" ", "-")}`) {
      navigate(`#pop-${title.toLowerCase().replace(" ", "-")}`);
    } else if (show && history.state.idx === 0) {
      navigate(`#pop-${title.toLowerCase().replace(" ", "-")}-%F0%9F%98%A1`);
    }
  }, [show]);

  return (
    <>
      <Backdrop show={show} onDismiss={handleDismiss} />
      <CSSTransition
        mountOnEnter
        unmountOnExit
        nodeRef={node}
        in={show}
        timeout={150}
        classNames={{ ...styles }}
      >
        <div ref={node} role="dialog" className={styles.modal}>
          <section className={styles.title}>
            <h2>{title}</h2>
            <Button
              className="fs-0"
              accent="dark"
              icon="close"
              iconLeft
              fit
              onClick={handleDismiss}
              size={1.5}
            />
          </section>
          <section className={styles.content}>
            <div className={styles.desc}>{children}</div>
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
};

export default Modal;
