import { useEffect, useState } from "react";

import styles from "./Library.module.css";
import Backdrop from "../common/Backdrop/Backdrop";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import Button from "../common/Button/Button";
import Icon from "../common/Icon/Icon";
import { useDispatch, useSelector } from "react-redux";
import { getCatalog } from "@/store/actions/catalog";
import Accordion from "../common/Accordion/Accordion";
import NodeList from "../common/NodeList/NodeList";

const Library = () => {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const action = useNavigationType();
  const location = useLocation();
  const dispatch = useDispatch();
  const nodeGroups = useSelector((state) => state.catalog);

  useEffect(() => {
    const path = location.pathname;
    if (!open && history.state.idx === 0 && location.hash === "#library") {
      navigate(path.substring(0, path.indexOf("#")), { replace: true });
    }
    dispatch(getCatalog());
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
            <header className={styles.header}>
              <section>
                <Button
                  onClick={handleDismiss}
                  icon="leftArrow"
                  size={1.2}
                  flat
                  className="fs-0 px-1 py-0p5"
                />
                <h1>Library</h1>
              </section>
              <section>
                <Icon name="search" size={1} className="fs-0" />
                <input type="text" placeholder="Search" spellCheck="false" />
              </section>
            </header>
            <section className={styles.content}>
              {nodeGroups.map((group) => (
                <Accordion
                  key={group.name}
                  title={
                    <div className="d-flex flex-center flex-primary-left">
                      <Icon name={group.icon} size={1} className="mr-1" />
                      <span>{group.name}</span>
                    </div>
                  }
                >
                  <NodeList nodes={group.nodes} />
                </Accordion>
              ))}
            </section>
          </>
        )}
      </aside>
    </>
  );
};

export default Library;
