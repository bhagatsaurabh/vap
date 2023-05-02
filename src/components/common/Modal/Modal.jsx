import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { CSSTransition } from "react-transition-group";

import Backdrop from "../Backdrop/Backdrop";
import styles from "./Modal.module.css";
import Button from "../Button/Button";
import { Constants, trapBetween } from "@/misc/utils";

const Modal = ({ title, children, onDismiss, onAction, controls }) => {
  const [_show, set_Show] = useState(false);
  const [queuedAction, setQueuedAction] = useState(null);

  useEffect(() => {
    set_Show(true);
  }, []);

  const pControls = controls ?? [];
  const navigate = useNavigate();
  const location = useLocation();
  const node = useRef(null);
  const action = useNavigationType();
  const bound = useRef(null);

  const handleDismiss = () => {
    if (_show) {
      navigate(-1);
      set_Show(false);
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

  const trapFocus = useCallback((event) => {
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
    if (_show && action === "POP") {
      set_Show(false);
    }
  }, [location]);

  useEffect(() => {
    if (_show) {
      const slug = `#pop-${title.toLowerCase().replace(" ", "-")}`;
      if (location.hash !== slug) {
        navigate(slug, { state: { popUp: true } });
      } else if (history.state.idx === 0) {
        navigate(`${slug}-%F0%9F%98%A1`, { state: { popUp: true } });
      }

      document.activeElement?.blur();
      bound.current = trapBetween(node.current);
      window.addEventListener("keydown", trapFocus);
    } else {
      window.removeEventListener("keydown", trapFocus);
    }
  }, [_show]);

  return (
    <>
      <Backdrop show={_show} onDismiss={handleDismiss} />
      <CSSTransition
        onExited={handleExited}
        mountOnEnter
        unmountOnExit
        nodeRef={node}
        in={_show}
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
