import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import PropTypes from "prop-types";

import styles from "./Library.module.css";
import Backdrop from "../common/Backdrop/Backdrop";
import Button from "../common/Button/Button";
import Icon from "../common/Icon/Icon";
import { getCatalog } from "@/store/actions/catalog";
import Accordion from "../common/Accordion/Accordion";
import NodeList from "../common/NodeList/NodeList";
import { fullUrl, splitUrl } from "@/misc/utils";

const Library = ({ onSelect, onDrop }) => {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const action = useNavigationType();
  const location = useLocation();
  const dispatch = useDispatch();
  let nodeGroups = useSelector((state) => state.catalog);
  const accordions = useRef([]);
  const prevPath = useSelector((state) => state.navigation.prev);
  const prevModal = useSelector((state) => state.navigation.modal);

  useEffect(() => {
    const path = location.pathname;
    if (!open && history.state.idx === 0 && location.hash === "#library") {
      navigate(path.substring(0, path.indexOf("#")), { replace: true });
    }
    dispatch(getCatalog());
  }, []);
  useEffect(() => {
    const prevHash = splitUrl(prevPath).hash;
    const prevModalHash = splitUrl(prevModal).hash;
    const currHash = location.hash === "#library";
    if (
      open &&
      action === "POP" &&
      !(
        (prevHash && currHash && location.hash !== prevHash) ||
        (prevModalHash && currHash && location.hash !== prevModalHash)
      )
    ) {
      setOpen(false);
    }
  }, [location]);
  useEffect(() => {
    if (show) {
      dispatch({ type: "navigation/set-prev", payload: fullUrl(location) });
      navigate("#library", { state: { popUp: true }, replace: location.hash === "#library" });
    }
  }, [show]);
  useEffect(() => {
    accordions.current.forEach((accordion) => accordion?.[query ? "open" : "close"]());
  }, [query]);

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
      dispatch({ type: "navigation/set-prev", payload: fullUrl(location) });
      navigate(-1);
      setOpen(false);
    }
  };
  const handleEnd = () => {
    if (!open) {
      setShow(false);
    }
  };
  const handleInput = (e) => {
    setQuery(e.target.value);
  };
  const handleDrop = (data, pos) => {
    onDrop(data, pos);
    handleDismiss();
  };

  if (query) {
    nodeGroups = nodeGroups
      .map((group) => {
        const filteredNodes = group.nodes.filter((node) =>
          node.name.toLowerCase().includes(query.toLowerCase())
        );
        return { ...group, nodes: filteredNodes };
      })
      .filter((group) => group.nodes.length);
  }

  const classes = [styles.library];
  if (open) classes.push(styles.open);

  return (
    <>
      <Backdrop
        show={show}
        onDismiss={handleDismiss}
        clear
        onDrop={(data, pos) => handleDrop(data, pos)}
      />
      <aside onTransitionEnd={handleEnd} className={classes.join(" ")}>
        <button data-tour="4" onClick={handleOpen} className={styles.control}>
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
                <input onInput={handleInput} type="text" placeholder="Search" spellCheck="false" />
              </section>
            </header>
            <section className={styles.content}>
              {nodeGroups.length === 0 && (
                <span className="c-grey">
                  Cannot find nodes with name matching &apos;{query}&apos;
                </span>
              )}
              {nodeGroups.map((group, idx) => (
                <Accordion
                  key={group.name}
                  title={
                    <div className="d-flex flex-center flex-primary-left">
                      <Icon name={group.icon} size={1} className="mr-1" />
                      <span>{group.name}</span>
                    </div>
                  }
                  ref={(e) => (accordions.current[idx] = e)}
                >
                  <NodeList
                    name={group.name}
                    nodes={group.nodes}
                    onSelect={(node) => onSelect(node)}
                  />
                </Accordion>
              ))}
            </section>
          </>
        )}
      </aside>
    </>
  );
};

Library.propTypes = {
  onSelect: PropTypes.func,
  onDrop: PropTypes.func,
};

export default Library;
