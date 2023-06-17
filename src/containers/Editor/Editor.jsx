import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { FlowConnect, Vector } from "flow-connect";
import "@flow-connect/audio";

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
  const fcRef = useRef(null);
  const blobRef = useRef(null);

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

  const handleSave = () => {
    const fc = fcRef.current;

    const uploader = document.createElement("input");
    uploader.type = "file";
    uploader.accept = "application/json,.vap";
    document.body.appendChild(uploader);
    uploader.style.display = "none";
    uploader.click();
    uploader.onchange = async () => {
      if (uploader.files.length > 0) {
        const content = await (await fetch(URL.createObjectURL(uploader.files[0]))).text();
        const flow = await fc.fromJson(content, async (id) => {
          return blobRef.current;
        });
        fc.render(flow);
        const testing = document.createElement("audio");
        testing.autoplay = true;
        testing.src = URL.createObjectURL(blobRef.current);
        document.body.appendChild(testing);
        testing.style.display = "none";
        testing.play();
      }
    };
  };
  const handleExport = async () => {
    const fc = fcRef.current;
    const flow = flowRef.current;

    const content = await fc.toJson(flow, (id, ref) => {
      blobRef.current = ref;
    });

    const downloader = document.createElement("a");
    document.body.appendChild(downloader);
    downloader.style.display = "none";
    const blob = new Blob([content], { type: "octet/stream" });
    const url = URL.createObjectURL(blob);
    downloader.href = url;
    downloader.download = "exported.json";
    downloader.click();
    URL.revokeObjectURL(url);
    downloader.remove();
  };
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
    const fc = await FlowConnect.create(mainEl.current);
    fcRef.current = fc;
    const flow = fc.createFlow({ name: "Test Flow" });
    const source = flow.createNode("audio/source", Vector.create(100, 100), {});
    const output = flow.createNode("audio/destination", Vector.create(200, 200), {});
    source.outputs[0].connect(output.inputs[0]);

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
