import styles from "./FlowCard.module.css";

const FlowCard = ({ preview }) => {
  console.log(preview?.id, preview?.name, preview?.img);

  return (
    <div className={styles.flowcard}>
      <img />
      <div className={styles.options}></div>
    </div>
  );
};

export default FlowCard;
