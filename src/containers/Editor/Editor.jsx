import { useLocation, useParams } from "react-router-dom";

import styles from "./Editor.module.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchFlow, initDatabase } from "@/store/actions/db";
import Header from "@/components/Header/Header";
import Brand from "@/components/common/Brand/Brand";
import Button from "@/components/common/Button/Button";
import EditorControls from "@/components/EditorControls/EditorControls";

/*
Context Menu
Stats
*/

const Editor = () => {
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  const loadAndUnwrap = async () => {
    await openDB();

    const result = await dispatch(fetchFlow(id));
    console.log(result.payload);
  };

  const openDB = async () => {
    await dispatch(initDatabase());
  };

  const handleSave = () => {};
  const handleExport = () => {};
  const handleDelete = () => {};
  const handlePlay = () => {};
  const handleStop = () => {};
  const handleReplay = () => {};

  useEffect(() => {
    if (id !== "temp") loadAndUnwrap();
  }, []);

  return (
    <>
      <Header
        left={<Brand size={1} fixed />}
        right={
          <div className={styles["flow-controls"]}>
            <Button
              busy={saving}
              disabled={saving}
              onClick={handleSave}
              icon="save"
              iconLeft
              size={1}
            >
              Save
            </Button>
            <Button onClick={handleExport} icon="export" size={1} className="px-0p75 py-0p5" />
            <Button onClick={handleDelete} icon="delete" size={1} className="px-0p75 py-0p5" />
          </div>
        }
        transparent
        fixed
      />
      <main className={styles.main}>
        <EditorControls onPlay={handlePlay} onStop={handleStop} onReplay={handleReplay} />
      </main>
    </>
  );
};

export default Editor;
