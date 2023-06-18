import { useEffect, useState } from "react";
import styles from "./FlowName.module.css";

const FlowName = ({ value, onUpdate }) => {
  const [name, setName] = useState(value);

  useEffect(() => {
    setName(value);
  }, [value]);

  const handleBlur = (val) => {
    if (!val) {
      setName(value);
      return;
    }
    onUpdate(val);
  };

  return (
    <input
      className={styles["flow-name-input"]}
      value={name || ""}
      type="text"
      spellCheck={false}
      onInput={(e) => setName(e.target.value)}
      onBlur={(e) => handleBlur(e.target.value)}
      placeholder={value}
    />
  );
};

export default FlowName;
