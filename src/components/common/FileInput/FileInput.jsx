import { useRef, useState } from "react";
import Button from "../Button/Button";
import styles from "./FileInput.module.css";

const FileInput = ({ fileName, onChange }) => {
  const inputEl = useRef(null);
  const [currFileName, setCurrFileName] = useState("");

  const handleChange = (e) => {
    setCurrFileName(e.target.files[0].name);
    onChange(e);
  };

  return (
    <div className={styles.fileinput}>
      <Button icon="file" iconLeft size={0.7} rect onClick={() => inputEl.current.click()}>
        {fileName || currFileName || "Select File"}
      </Button>
      <input ref={inputEl} type="file" onChange={(e) => handleChange(e)} />
    </div>
  );
};

export default FileInput;
