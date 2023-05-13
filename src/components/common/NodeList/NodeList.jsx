import { useState } from "react";
import { createPortal } from "react-dom";

import Icon from "../Icon/Icon";
import styles from "./NodeList.module.css";
import Modal from "../Modal/Modal";
import StaticHtml from "../StaticHtml/StaticHtml";

const NodeList = ({ name, nodes }) => {
  const handleInfo = (node) => {
    setSelected(node);
    setShowDocs(true);
  };
  const closeInfo = () => {
    setShowDocs(false);
  };
  const [showDocs, setShowDocs] = useState(false);
  const [selected, setSelected] = useState(null);

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
            <StaticHtml url={selected.docs} />
          </Modal>,
          document.body
        )}
      <div className={styles.nodelist}>
        {nodes.map((node) => (
          <button key={node.name} className="d-flex flex-center jc-space-between">
            <div className="d-flex flex-center">
              <Icon size={1} name={node.icon} className="fs-0 mr-1" />
              <span>{node.name}</span>
            </div>
            <Icon
              name="info"
              size={1}
              className="fs-0"
              onClick={() => handleInfo(node)}
              focusable
            />
          </button>
        ))}
      </div>
    </>
  );
};

export default NodeList;
