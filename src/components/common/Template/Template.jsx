import { useState } from "react";
import styles from "./Template.module.css";
import Spinner from "../Spinner/Spinner";
import { useDispatch } from "react-redux";
import { getTemplate } from "@/store/actions/templates";

const Template = ({ template, onBusy, onUnlock, onSelect, disabled }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const classes = [styles.template];
  if (disabled) classes.push(styles.disabled);

  const fetchTemplate = async () => {
    onBusy(true);

    if (!template.url) {
      onSelect(template, null);
      return;
    }

    setLoading(true);
    const result = await dispatch(getTemplate(template.url));
    if (result.payload) {
      const blobUrl = URL.createObjectURL(result.payload);
      onSelect(template, blobUrl);
    } else {
      onBusy(false);
    }
    setLoading(false);
  };

  return (
    <button disabled={disabled} onClick={() => fetchTemplate()} className={classes.join(" ")}>
      {loading && (
        <div className={styles.spinner}>
          <Spinner size={1.5} accent="dark" className="fs-0">
            Downloading...
          </Spinner>
        </div>
      )}
      <img alt={`${template.name} thumbnail`} src={template.img} />
      <h4>{template.name}</h4>
    </button>
  );
};

export default Template;
