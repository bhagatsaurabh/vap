import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

import styles from "./StaticHtml.module.css";
import Spinner from "../Spinner/Spinner";
import { getDocs } from "@/store/actions/docs";

const StaticHtml = ({ url }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [content, setContent] = useState("");

  const load = async () => {
    setLoading(true);
    const result = await dispatch(getDocs(url));
    setContent(DOMPurify.sanitize(result.payload ?? ""));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className={styles.statichtml}>
      {loading ? (
        <div className={styles.spinner}>
          <Spinner size={1.1}>Fetching Docs...</Spinner>
        </div>
      ) : (
        parse(content)
      )}
    </div>
  );
};

export default StaticHtml;
