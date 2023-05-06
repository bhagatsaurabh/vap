import styles from "./Template.module.css";

const Template = ({ template, onSelect }) => {
  return (
    <button onClick={() => onSelect(template)} className={styles.template}>
      <img alt={`${template.name} thumbnail`} src={template.img} />
      <h4>{template.name}</h4>
    </button>
  );
};

export default Template;
