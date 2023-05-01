import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import styles from "./PopUp.module.css";

const PopUp = ({ show, title, children, onDismiss, onAction, controls }) => {
  const pControls = controls ?? [];

  return (
    <Modal show={show} title={title} onDismiss={onDismiss}>
      <div className={styles.desc}>{children}</div>
      <div className={styles.controls}>
        {pControls.map((text) => (
          <Button key={text} accent="dark" size={1} onClick={() => onAction(text)}>
            {text}
          </Button>
        ))}
      </div>
    </Modal>
  );
};

export default PopUp;
