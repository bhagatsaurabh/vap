import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { NodeState } from "flow-connect";
import PropTypes from "prop-types";

import Backdrop from "../common/Backdrop/Backdrop";
import styles from "./Properties.module.css";
import { fullUrl, splitUrl } from "@/misc/utils";
import Button from "../common/Button/Button";
import Toggle from "../common/Toggle/Toggle";
import FileInput from "../common/FileInput/FileInput";

const Properties = ({ slide, onDismiss, node }) => {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const action = useNavigationType();
  const prevPath = useSelector((state) => state.navigation.prev);
  const prevModal = useSelector((state) => state.navigation.modal);
  const dispatch = useDispatch();
  const [forceRender, setForceRender] = useState(false);
  const [nodeName, setNodeName] = useState(node?.name ?? "");
  const state = useRef([]);
  const controls = useRef([]);

  useEffect(() => {
    if (node?.name) {
      const stateUI = [];
      const controlsUI = [];
      stateUI.push(
        ...node.ui.query("core/toggle"),
        ...node.ui.query("core/source"),
        ...node.ui.query("core/select"),
        ...node.ui.query("core/slider"),
        ...node.ui.query("core/v-slider"),
        ...node.ui.query("core/radio-group")
      );
      controlsUI.push(...node.ui.query("core/button"));

      state.current = stateUI.filter((ui) => ui.propName);
      controls.current = controlsUI;

      setNodeName(node.name);
    }
  }, [node]);
  useEffect(() => {
    const path = location.pathname;
    if (!open && history.state.idx === 0 && location.hash === "#properties") {
      navigate(path.substring(0, path.indexOf("#")), { replace: true });
    }
  }, []);
  useEffect(() => {
    const prevHash = splitUrl(prevPath).hash;
    const prevModalHash = splitUrl(prevModal).hash;
    const currHash = location.hash === "#properties";
    if (
      open &&
      action === "POP" &&
      !(
        (prevHash && currHash && location.hash !== prevHash) ||
        (prevModalHash && currHash && location.hash !== prevModalHash)
      )
    ) {
      setOpen(false);
      onDismiss();
    }
  }, [location]);
  useEffect(() => {
    if (show) {
      dispatch({ type: "navigation/set-prev", payload: fullUrl(location) });
      navigate("#properties", { state: { popUp: true }, replace: location.hash === "#properties" });
    }
  }, [show]);
  useEffect(() => {
    if (slide) {
      handleOpen();
    }
  }, [slide]);

  const handleOpen = () => {
    if (!open) {
      setOpen(true);
      setShow(true);
    }
  };
  const handleDismiss = () => {
    if (show) {
      dispatch({ type: "navigation/set-prev", payload: fullUrl(location) });
      navigate(-1);
      setOpen(false);
      onDismiss();
    }
  };
  const handleEnd = () => {
    if (!open) {
      setShow(false);
    }
  };

  const handleToggle = () => {
    node?.toggle();
    setForceRender(!forceRender);
  };
  const handleDelete = () => {
    node?.dispose();
    handleDismiss();
  };
  const handleTitle = (newName) => {
    setNodeName(newName);
    if (newName) {
      node.name = newName;
      setForceRender(!forceRender);
    } else {
      node.name = "No Name";
      setForceRender(!forceRender);
    }
  };

  const changeToggle = (value, propName) => {
    node.state[propName] = value;
    setForceRender(!forceRender);
  };
  const changeSource = (file, propName) => {
    if (file) {
      node.state[propName] = file;
      setForceRender(!forceRender);
    }
  };
  const changeSelect = (value, propName) => {
    node.state[propName] = value;
    setForceRender(!forceRender);
  };
  const changeSlider = (value, propName) => {
    node.state[propName] = value;
    setForceRender(!forceRender);
  };
  const changeRadioGroup = (value, propName) => {
    node.state[propName] = value;
    setForceRender(!forceRender);
  };

  const classes = [styles.properties];
  if (open) classes.push(styles.open);

  return (
    <>
      <Backdrop show={show} onDismiss={handleDismiss} clear />
      <aside onTransitionEnd={handleEnd} className={classes.join(" ")}>
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
                <h1>Properties</h1>
              </section>
            </header>
            {node && (
              <section className={styles.content}>
                <h3>{node.name}</h3>
                <div className={styles.controls}>
                  <Button
                    icon={
                      node?.renderState.nodeState === NodeState.MINIMIZED ? "maximize" : "minimize"
                    }
                    iconLeft
                    rect
                    onClick={handleToggle}
                  />
                  <Button icon="delete" iconLeft rect onClick={handleDelete} />
                </div>
                <div className={styles.prop}>
                  <span className={styles.name}>Title</span>
                  <span className={styles.value}>
                    <input
                      type="text"
                      spellCheck={false}
                      className={styles["prop-input"]}
                      value={nodeName}
                      onInput={(e) => handleTitle(e.target.value)}
                      placeholder={node.name}
                    />
                  </span>
                </div>
                <div className={styles.prop}>
                  <span className={styles.name}>Type</span>
                  <span className={styles.value}>
                    <input
                      disabled
                      type="text"
                      spellCheck={false}
                      className={styles["prop-input"]}
                      value={node.type}
                    />
                  </span>
                </div>
                <h3>State</h3>
                {state.current.length === 0 && <p>No State</p>}
                {state.current.map((ui) => {
                  switch (ui.type) {
                    case "core/toggle": {
                      return (
                        <div key={ui.id} className={styles.prop}>
                          <span className={styles.name}>{ui.propName}</span>
                          <span className={[styles.value, "d-flex"].join(" ")}>
                            <Toggle
                              checked={node.state[ui.propName]}
                              onChange={() => changeToggle(!node.state[ui.propName], ui.propName)}
                            />
                          </span>
                        </div>
                      );
                    }
                    case "core/source": {
                      return (
                        <div key={ui.id} className={styles.prop}>
                          <span className={styles.name}>{ui.propName}</span>
                          <span className={styles.value}>
                            <FileInput
                              fileName={node.state[ui.propName]?.name}
                              onChange={(e) => changeSource(e.target.files[0], ui.propName)}
                            />
                          </span>
                        </div>
                      );
                    }
                    case "core/select": {
                      return (
                        <div key={ui.id} className={styles.prop}>
                          <span className={styles.name}>{ui.propName}</span>
                          <span className={styles.value}>
                            <select
                              value={ui.selected}
                              onChange={(e) => changeSelect(e.target.value, ui.propName)}
                            >
                              {ui.values.map((val) => (
                                <option key={val} value={val}>
                                  {val}
                                </option>
                              ))}
                            </select>
                          </span>
                        </div>
                      );
                    }
                    case "core/slider":
                    case "core/v-slider": {
                      return (
                        <div key={ui.id} className={styles.prop}>
                          <span className={styles.name}>{ui.propName}</span>
                          <span className={styles.value}>
                            <input
                              type="range"
                              min={ui.min}
                              max={ui.max}
                              value={ui.value}
                              onChange={(e) => changeSlider(e.target.value, ui.propName)}
                            />
                            <h6 className="my-0 font-weight-lighter mt-0p5">{ui.value}</h6>
                          </span>
                        </div>
                      );
                    }
                    case "core/radio-group": {
                      return (
                        <div key={ui.id} className={styles.prop}>
                          <span className={styles.name}>{ui.propName}</span>
                          <span className={styles.value}>
                            <fieldset>
                              {ui.values.map((val) => (
                                <div key={val} className={styles.rgoption}>
                                  <input
                                    onChange={(e) => changeRadioGroup(e.target.value, ui.propName)}
                                    type="radio"
                                    value={val}
                                    name={ui.propName}
                                    checked={ui.selected === val}
                                  />
                                  <label>{val}</label>
                                  <br />
                                </div>
                              ))}
                            </fieldset>
                          </span>
                        </div>
                      );
                    }
                    default:
                      break;
                  }
                })}
                <h3>Controls</h3>
                {controls.current.length === 0 && <p>No Controls</p>}
                <div className={styles.propcontrols}>
                  {controls.current.map((ui) => {
                    switch (ui.type) {
                      case "core/button": {
                        return (
                          <Button
                            key={ui.id}
                            size={0.75}
                            rect
                            onClick={() => ui.sendEvent("click")}
                          >
                            {ui.label.text}
                          </Button>
                        );
                      }
                      default:
                        break;
                    }
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </aside>
    </>
  );
};

Properties.propTypes = {
  slide: PropTypes.bool,
  onDismiss: PropTypes.func,
  node: PropTypes.any,
};

export default Properties;
