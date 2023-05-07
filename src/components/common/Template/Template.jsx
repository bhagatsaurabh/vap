import { useState } from "react";
import styles from "./Template.module.css";
import Spinner from "../Spinner/Spinner";
import { useDispatch } from "react-redux";
import { getTemplate } from "@/store/actions/templates";

const Template = ({ template, onSelect }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fetchTemplate = async () => {
    if (!template.url) {
      onSelect(template, null);
      return;
    }

    setLoading(true);
    const result = await dispatch(getTemplate(template.url));
    if (result.payload) {
      const blobUrl = URL.createObjectURL(result.payload);
      onSelect(template, blobUrl);
    }
    setLoading(false);
  };

  return (
    <button onClick={() => fetchTemplate()} className={styles.template}>
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
