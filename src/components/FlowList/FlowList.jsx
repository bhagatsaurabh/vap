import { useDispatch, useSelector } from "react-redux";
import styles from "./FlowList.module.css";
import { useEffect, useState } from "react";
import { fetchPreviews } from "@/store/actions/db";
import FlowCard from "../FlowCard/FlowCard";
import Icon from "../common/Icon/Icon";

const FlowList = () => {
  const dbStatus = useSelector((state) => state.database.status);
  const previews = useSelector((state) => state.database.previews);
  const dispatch = useDispatch();
  const [fetching, setFetching] = useState(false);

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

  return (
    <div className={styles.flowlist}>
      {previews.length === 0 ? (
        <div className={styles.empty}>
          <Icon size={2} accent="dark" name="empty" />
          <span>Empty</span>
        </div>
      ) : (
        previews.map((preview) => <FlowCard preview={preview} />)
      )}
    </div>
  );
};

export default FlowList;
