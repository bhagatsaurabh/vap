import { useEffect, useState } from "react";

import styles from "./Library.module.css";
import Backdrop from "../common/Backdrop/Backdrop";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

const Library = () => {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const action = useNavigationType();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (!open && history.state.idx === 0 && location.hash === "#library") {
      navigate(path.substring(0, path.indexOf("#")), { replace: true });
    }
  }, []);
  useEffect(() => {
    if (open && action === "POP") {
      setOpen(false);
    }
  }, [location]);
  useEffect(() => {
    if (show) {
      navigate("#library", { state: { popUp: true }, replace: location.hash === "#library" });
    }
  }, [show]);

  const handleOpen = () => {
    if (!open) {
      setOpen(true);
      setShow(true);
    } else {
      handleDismiss();
    }
  };
  const handleDismiss = () => {
    if (show) {
      navigate(-1);
      setOpen(false);
    }
  };
  const handleEnd = () => {
    if (!open) {
      setShow(false);
    }
  };

  const classes = [styles.library];
  if (open) classes.push(styles.open);

  return (
    <>
      <Backdrop show={show} onDismiss={handleDismiss} clear />
      <aside onTransitionEnd={handleEnd} className={classes.join(" ")}>
        <button onClick={handleOpen} className={styles.control}>
          <p>Library</p>
        </button>
        {show && (
          <>
            <div className={styles.header}>
              <h1>Library</h1>
              <input type="text" placeholder="Search" />
            </div>
            <div className={styles.content}></div>
          </>
        )}
      </aside>
    </>
  );
};

export default Library;
