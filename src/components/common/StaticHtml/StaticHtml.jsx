import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

import styles from "./StaticHtml.module.css";
import Spinner from "../Spinner/Spinner";
import { getDocs } from "@/store/actions/docs";

const StaticHtml = ({ url }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [height, setHeight] = useState(0);
  const el = useRef(null);

  const load = async () => {
    setLoading(true);
    const result = await dispatch(getDocs(url));
    setContent(DOMPurify.sanitize(result.payload ?? ""));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!loading) {
      setHeight(el.current.offsetHeight);
    }
  }, [loading]);

  return (
    <div className={styles.statichtml} style={{ height: `${height + 1}px` }}>
      {loading ? (
        <div className={styles.spinner}>
          <Spinner size={1.1}>Fetching Docs...</Spinner>
        </div>
      ) : (
        <div className="docs" ref={el}>
          {parse(content)}
        </div>
      )}
    </div>
  );
};

export default StaticHtml;
