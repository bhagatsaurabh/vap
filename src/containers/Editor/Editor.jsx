import { useLocation, useParams } from "react-router-dom";

import styles from "./Editor.module.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchFlow, initDatabase } from "@/store/actions/db";

/*
Flow Controls
Editor Controls
Context Menu
Toolbox
Stats
*/

const Editor = () => {
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const loadAndUnwrap = async () => {
    await openDB();

    const result = await dispatch(fetchFlow(id));
    console.log(result.payload);
  };

  const openDB = async () => {
    await dispatch(initDatabase());
  };

  useEffect(() => {
    if (id !== "temp") loadAndUnwrap();
  }, []);

  return;
};

export default Editor;
