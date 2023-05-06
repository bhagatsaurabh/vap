import { useDispatch, useSelector } from "react-redux";
import styles from "./Toast.module.css";
import { useState } from "react";
import Icon from "../Icon/Icon";

const Toast = () => {
  const [open, setOpen] = useState(false);
  const [timerHandle, setTimerHandle] = useState(-1);
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.toast.data);

  const classes = [styles.toast];
  const timerClasses = [styles.timer];
  if (toast && !open && timerHandle < 0) {
    setOpen(true);
  } else if (!toast && open) {
    setOpen(false);
  }
  if (open) {
    if (timerHandle < 0) {
      const handle = setTimeout(() => setOpen(false), 5000);
      setTimerHandle(handle);
    }
    classes.push(styles.open);
    timerClasses.push(styles.start);
  }

  const handleTransitionEnd = () => {
    if (!open) {
      dispatch({ type: "toast/clear" });
      setTimerHandle(-1);
    }
  };

  const handleDismiss = () => {
    clearTimeout(timerHandle);
    setOpen(false);
  };

  return (
    <aside onTransitionEnd={handleTransitionEnd} className={classes.join(" ")}>
      {open && (
        <>
          <div className={timerClasses.join(" ")}></div>
          <div className={styles.content}>
            <Icon size={1} name={toast.type} className="fs-0 mr-0p5" />
            <span>{toast.message}</span>
          </div>
          <button onClick={handleDismiss}>Dismiss</button>
        </>
      )}
    </aside>
  );
};

export default Toast;
