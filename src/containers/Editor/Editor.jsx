import { useLocation, useParams } from "react-router-dom";

import styles from "./Editor.module.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchFlow } from "@/store/actions/db";

const Editor = () => {
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const loadAndUnwrap = async () => {
    const flow = dispatch(fetchFlow(id));
    console.log(flow);
  };

  useEffect(() => {
    if (id !== "temp") loadAndUnwrap();
  }, []);

  return <span>Editor {id}</span>;
};

export default Editor;
