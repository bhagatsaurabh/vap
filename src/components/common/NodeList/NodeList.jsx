import Icon from "../Icon/Icon";
import styles from "./NodeList.module.css";

const NodeList = ({ nodes }) => {
  const handleInfo = () => {};

  return (
    <div className={styles.nodelist}>
      {nodes.map((node) => (
        <button key={node.name} className="d-flex flex-center jc-space-between">
          <div className="d-flex flex-center">
            <Icon size={1} className="fs-0 mr-1" />
            <span>{node.name}</span>
          </div>
          <Icon name="info" size={1} className="fs-0" onClick={handleInfo} focusable />
        </button>
      ))}
    </div>
  );
};

export default NodeList;
