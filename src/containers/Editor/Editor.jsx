import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { FlowConnect } from "flow-connect";
import { Source, Destination } from "@flow-connect/audio";

import styles from "./Editor.module.css";
import { fetchFlow, initDatabase } from "@/store/actions/db";
import Header from "@/components/Header/Header";
import Brand from "@/components/common/Brand/Brand";
import Button from "@/components/common/Button/Button";
import EditorControls from "@/components/EditorControls/EditorControls";
import Library from "@/components/Library/Library";

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
  const mainEl = useRef(null);
  const flowRef = useRef(null);

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
  const handlePlay = () => {
    flowRef.current.start();
  };
  const handleStop = () => {
    flowRef.current.stop();
  };
  const handleReplay = () => {};

  const start = async () => {
    const fc = new FlowConnect(mainEl.current);
    await fc.setupAudioContext();
    const flow = fc.createFlow({ name: "Test Flow" });
    const source = new Source(flow);
    const output = new Destination(flow);
    fc.render(flow);
    flowRef.current = flow;
  };

  useEffect(() => {
    if (id !== "temp") loadAndUnwrap();
    start();
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
        <Library />
        <canvas ref={mainEl}></canvas>
      </main>
    </>
  );
};

export default Editor;
