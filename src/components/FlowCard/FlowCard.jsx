import PropTypes from "prop-types";

import { Link } from "react-router-dom";
import styles from "./FlowCard.module.css";
import defaultPreview from "@/assets/images/default-preview.png";
import Button from "../common/Button/Button";

const FlowCard = ({ preview, onDelete }) => {
  const handleDelete = (event) => {
    event.preventDefault();
    onDelete(preview);
  };

  return (
    <Link to={`/flows/${preview.id}`} className="a-reset">
      <div className={styles.flowcard}>
        <div className={styles.options}>
          <Button flat icon="edit" size={0.8} accent="dark" />
          <Button onClick={handleDelete} flat icon="delete" size={0.8} accent="dark" />
        </div>
        <img alt={`${preview.name} thumbnail`} src={preview.img ?? defaultPreview} />
        <h3>{preview.name}</h3>
      </div>
    </Link>
  );
};

FlowCard.propTypes = {
  preview: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    img: PropTypes.string,
  }),
  onDelete: PropTypes.func,
};

export default FlowCard;
