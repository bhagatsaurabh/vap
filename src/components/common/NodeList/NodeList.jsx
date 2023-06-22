import { useState } from "react";
import { createPortal } from "react-dom";

import Icon from "../Icon/Icon";
import styles from "./NodeList.module.css";
import Modal from "../Modal/Modal";
import StaticHtml from "../StaticHtml/StaticHtml";

const NodeList = ({ name, nodes, onSelect }) => {
  const handleInfo = (e, node) => {
    e.stopPropagation();
    setSelected(node);
    setShowDocs(true);
  };
  const closeInfo = () => {
    setShowDocs(false);
  };
  const [showDocs, setShowDocs] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dragged, setDragged] = useState("");

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("text/plain", type);
    setDragged(type);
  };
  const handleDragEnd = () => {
    setDragged(null);
  };

  return (
    <>
      {showDocs &&
        createPortal(
          <Modal
            title={`${name}: ${selected.name}`}
            onDismiss={closeInfo}
            onAction={() => {}}
            controls={["Close"]}
            layer={1}
            overflow
          >
            <StaticHtml className="docs-modal" url={selected.docs} />
          </Modal>,
          document.body
        )}
      <div className={styles.nodelist}>
        {nodes.map((node) => (
          <button
            key={node.type}
            className={[
              "d-flex flex-center jc-space-between",
              dragged === node.type ? styles.dragged : "",
            ].join(" ")}
            onClick={() => onSelect(node)}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, node.type)}
            onDragEnd={handleDragEnd}
          >
            <div className="d-flex flex-center">
              <Icon size={1} name={node.icon} className="fs-0 mr-1" />
              <span>{node.name}</span>
            </div>
            <Icon
              name="info"
              size={1}
              className="fs-0"
              onClick={(e) => handleInfo(e, node)}
              focusable
            />
          </button>
        ))}
      </div>
    </>
  );
};

export default NodeList;
