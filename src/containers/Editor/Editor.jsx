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
import Spinner from "@/components/common/Spinner/Spinner";

/*
Context Menu
Stats
*/

const Editor = () => {
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadMsg, setLoadMsg] = useState(null);
  const [state, setState] = useState("stopped");
  const dispatch = useDispatch();
  const mainEl = useRef(null);
  const flowRef = useRef(null);

  const loadAndUnwrap = async () => {
    setState("loading");

    setLoadMsg("Connecting to DB");
    await openDB();

    setLoadMsg("Fetching flow");
    const result = await dispatch(fetchFlow(id));

    setLoadMsg("Unwrapping");
    setTimeout(() => {
      setLoadMsg("Rendering");
    }, 0);

    setTimeout(() => {
      setLoadMsg(null);
      setState("stopped");
    }, 0);

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
    setState("playing");
  };
  const handleStop = () => {
    flowRef.current.stop();
    setState("stopped");
  };
  const handleReplay = () => {
    handleStop();
    handlePlay();
  };

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
        className="pointer-events-none"
        left={<Brand size={1} fixed editor />}
        right={
          <div className={styles["flow-controls"]}>
            <Button
              busy={saving}
              disabled={saving || state === "loading"}
              onClick={handleSave}
              icon="save"
              iconLeft
              size={1}
              rect
            >
              Save
            </Button>
            <Button
              disabled={state === "loading"}
              onClick={handleExport}
              icon="export"
              size={1}
              className="px-0p75 py-0p5"
              rect
            />
            <Button
              disabled={state === "loading"}
              onClick={handleDelete}
              icon="delete"
              size={1}
              className="px-0p75 py-0p5"
              rect
            />
          </div>
        }
        transparent
        fixed
      />
      <main className={styles.main}>
        {loadMsg && (
          <div className={styles.spinner}>
            <Spinner size={2}>{loadMsg}</Spinner>
          </div>
        )}
        <EditorControls
          state={state}
          onPlay={handlePlay}
          onStop={handleStop}
          onReplay={handleReplay}
        />
        <Library />
        <canvas ref={mainEl}></canvas>
      </main>
    </>
  );
};

export default Editor;
