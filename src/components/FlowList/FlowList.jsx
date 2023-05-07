import { useDispatch, useSelector } from "react-redux";
import styles from "./FlowList.module.css";
import { useEffect, useState } from "react";
import { fetchPreviews, removeFlow } from "@/store/actions/db";
import FlowCard from "../FlowCard/FlowCard";
import Icon from "../common/Icon/Icon";
import Spinner from "../common/Spinner/Spinner";
import Modal from "../common/Modal/Modal";

const FlowList = () => {
  const dbStatus = useSelector((state) => state.database.status);
  const previews = useSelector((state) => state.database.previews);
  const dirty = useSelector((state) => state.database.dirty);
  const dispatch = useDispatch();
  const [fetching, setFetching] = useState(false);
  const [markedFlow, setMarkedFlow] = useState(null);

  const handleFetchPreviews = async () => {
    try {
      setFetching(true);
      await dispatch(fetchPreviews());
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (dbStatus === "open") {
      handleFetchPreviews();
    }
  }, [dbStatus]);
  useEffect(() => {
    if (dirty) {
      handleFetchPreviews();
    }
  }, [dirty]);

  const handleDelete = () => {
    dispatch(removeFlow(markedFlow));
  };

  return (
    <>
      {markedFlow && (
        <Modal
          title="Are you sure ?"
          onDismiss={() => setMarkedFlow(null)}
          controls={["Yes", "Cancel"]}
          onAction={(action) => action === "Yes" && handleDelete()}
        >
          <span>
            Delete flow <em>{markedFlow.name}</em> ?
          </span>
        </Modal>
      )}
      <div className={styles.flowlist}>
        {fetching ? (
          <div className={styles.spinner}>
            <Spinner size={2} accent="dark" className="fs-0">
              Loading Flows...
            </Spinner>
          </div>
        ) : previews.length === 0 ? (
          <div className={styles.empty}>
            <Icon size={2} accent="dark" name="empty" />
            <span>Empty</span>
          </div>
        ) : (
          previews.map((preview) => (
            <FlowCard onDelete={(data) => setMarkedFlow(data)} key={preview.id} preview={preview} />
          ))
        )}
      </div>
    </>
  );
};

export default FlowList;
