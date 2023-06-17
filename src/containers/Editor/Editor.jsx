import JSZip from "jszip";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FlowConnect } from "flow-connect";
import "@flow-connect/audio";

import styles from "./Editor.module.css";
import { fetchFlow, fetchPreview, initDatabase, removeFlow, saveFlow } from "@/store/actions/db";
import Header from "@/components/Header/Header";
import Brand from "@/components/common/Brand/Brand";
import Button from "@/components/common/Button/Button";
import EditorControls from "@/components/EditorControls/EditorControls";
import Library from "@/components/Library/Library";
import Spinner from "@/components/common/Spinner/Spinner";
import Modal from "@/components/common/Modal/Modal";
import { FlowConnectContext } from "@/contexts/flow-connect";

/*
Context Menu
Stats
Properties
*/

const Editor = () => {
  const { id } = useParams();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [loadMsg, setLoadMsg] = useState(null);
  const [state, setState] = useState("stopped");
  const [flow, setFlow] = useState(null);
  const [preview, setPreview] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dispatch = useDispatch();
  const mainEl = useRef(null);
  const { flowConnect, setFlowConnect } = useContext(FlowConnectContext);
  const flowRef = useRef(null);
  const navigate = useNavigate();

  const loadAndUnwrap = async (fc) => {
    setState("loading");

    setLoadMsg("Connecting to DB");
    await openDB();

    setLoadMsg("Fetching flow");
    const result = await dispatch(fetchFlow(id));
    const preview = await dispatch(fetchPreview(id));
    setPreview(preview.payload);

    setLoadMsg("Unwrapping");
    if (result.payload) {
      const pack = await (await fetch(result.payload)).blob();
      let zip = new JSZip();
      zip = await zip.loadAsync(pack);
      const serializedFlow = await zip.file("flow.json").async("string");

      const raw = {};
      for (let path of Object.keys(zip.files).filter((path) => path.startsWith("raw/"))) {
        const id = path.replace("raw/", "");
        raw[id] = await zip.file(path).async("blob");
      }

      const deSerializedFlow = await (fc ?? flowConnect).fromJson(serializedFlow, async (id) => {
        return raw[id];
      });
      setLoadMsg("Rendering");
      (fc ?? flowConnect).render(deSerializedFlow);
    }

    setLoadMsg(null);
    setState("stopped");

    return preview.payload;
  };

  const openDB = async () => {
    await dispatch(initDatabase());
  };

  const handleSave = async () => {
    setSaving(true);

    let prwBlobUrl = null;
    if (flow?.nodes.size !== 0) {
      const ratio = 4 / 3;
      const height = flowConnect.canvas.width / ratio;
      const prwCanvas = new OffscreenCanvas(flowConnect.canvas.width, height);
      prwCanvas
        .getContext("2d")
        .drawImage(flowConnect.canvas, 0, 0, flowConnect.canvas.width, height);
      const prwBlob = await prwCanvas.convertToBlob();
      prwBlobUrl = URL.createObjectURL(prwBlob);
    }

    const pack = await handleExport();
    const packURL = URL.createObjectURL(pack);
    await dispatch(
      saveFlow({ id, flow: packURL, preview: { name: preview.name, img: prwBlobUrl } })
    );
    prwBlobUrl && URL.revokeObjectURL(prwBlobUrl);
    URL.revokeObjectURL(packURL);

    setSaving(false);
  };
  const handleExport = async (fc, inFlow) => {
    const raw = {};
    const serializedFlow = await (fc ?? flowConnect).toJson(inFlow ?? flow, (id, blob) => {
      raw[id] = blob;
    });
    const flowBlob = new Blob([serializedFlow], { type: "application/json" });

    let zip = new JSZip();
    zip.file("flow.json", flowBlob);
    Object.keys(raw).forEach((id) => zip.file(`raw/${id}`, raw[id]));
    const pack = await zip.generateAsync({ type: "blob" });

    return pack;
  };
  const handleDownload = async () => {
    const pack = await handleExport();

    const downloader = document.createElement("a");
    document.body.appendChild(downloader);
    downloader.style.display = "none";
    const url = URL.createObjectURL(pack);
    downloader.href = url;
    downloader.download = `${preview.name.toLowerCase().replace(" ", "-")}.vap`;
    downloader.click();
    URL.revokeObjectURL(url);
    downloader.remove();
  };
  const handleDelete = () => {
    if (id !== "temp") {
      dispatch(removeFlow({ id, name: preview.name }));
      navigate("/flows");
    }
  };
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

  const init = async () => {
    let newFc;
    if (!flowConnect) {
      newFc = await FlowConnect.create(mainEl.current);
      setFlowConnect(newFc);
    } else {
      newFc = flowConnect;
    }

    if (id !== "temp") {
      const prw = await loadAndUnwrap(newFc);
      if (!flow) {
        const newFlow = newFc.createFlow({ name: "New Flow", rules: {} });
        const pack = await handleExport(newFc, newFlow);
        await dispatch(saveFlow({ id, flow: URL.createObjectURL(pack), preview: prw }));
        setFlow(newFlow);
      }
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      {confirmDelete && (
        <Modal
          title="Are you sure ?"
          onDismiss={() => setConfirmDelete(false)}
          controls={["Yes", "Cancel"]}
          onAction={(action) => action === "Yes" && handleDelete()}
        >
          <span>
            Delete flow <em>{preview.name}</em> ?
          </span>
        </Modal>
      )}
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
              onClick={handleDownload}
              icon="export"
              size={1}
              className="px-0p75 py-0p5"
              rect
            />
            <Button
              disabled={state === "loading" || id === "temp"}
              onClick={() => setConfirmDelete(true)}
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
