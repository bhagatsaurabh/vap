import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Header from "@/components/Header/Header";
import styles from "./Flows.module.css";
import Footer from "@/components/Footer/Footer";
import InteractiveLogo from "@/components/common/InteractiveLogo/InteractiveLogo";
import Brand from "@/components/common/Brand/Brand";
import Button from "@/components/common/Button/Button";
import Footnote from "@/components/Footnote/Footnote";
import { fetchPreviews, initDatabase, saveFlow } from "@/store/actions/db";
import Spinner from "@/components/common/Spinner/Spinner";
import Collapsible from "@/components/common/Collapsible/Collapsible";
import Modal from "@/components/common/Modal/Modal";
import FlowList from "@/components/FlowList/FlowList";
import CreateDialog from "@/components/CreateDialog/CreateDialog";
import JSZip from "jszip";

const Flows = () => {
  const refEl = useRef(null);
  const provideRef = () => refEl.current;
  const dispatch = useDispatch();
  const [openingDB, setOpeningDB] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const error = useSelector((state) => state.database.error);

  const handleOpenDB = async () => {
    try {
      setOpeningDB(true);
      await dispatch(initDatabase());
    } finally {
      setOpeningDB(false);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchPreviews());
    setRefreshing(false);
  };
  const handleImport = async () => {
    const uploader = document.createElement("input");
    uploader.type = "file";
    uploader.accept = ".zip,.vap";
    document.body.appendChild(uploader);
    uploader.style.display = "none";
    uploader.click();
    uploader.onchange = async () => {
      if (uploader.files.length > 0) {
        const pack = await (await fetch(URL.createObjectURL(uploader.files[0]))).blob();
        const flowName = await verifyPack(pack);
        if (flowName) {
          const packURL = URL.createObjectURL(pack);
          await dispatch(saveFlow({ flow: packURL, preview: { name: flowName, img: null } }));
          URL.revokeObjectURL(packURL);
        } else {
          dispatch({
            type: "toast/set",
            payload: { type: "error", message: "File is not a valid VAP pack" },
          });
        }
      }
      uploader.remove();
    };
  };
  const verifyPack = async (pack) => {
    let name = null;
    try {
      let zip = new JSZip();
      zip = await zip.loadAsync(pack);
      if (!Object.keys(zip.files).includes("flow.json")) return null;
      let serializedFlow = await zip.file("flow.json").async("string");
      serializedFlow = JSON.parse(serializedFlow);
      name = serializedFlow.name;
    } catch (_) {
      return null;
    }

    return name;
  };

  useEffect(() => {
    handleOpenDB();
  }, []);

  return (
    <>
      {error && (
        <Modal
          title={error.title}
          onDismiss={() => dispatch({ type: "database/clear-error" })}
          controls={["Retry", "Close"]}
          onAction={(action) => action === "Retry" && handleOpenDB()}
        >
          {error.message}
          <Collapsible summary="More Details">{error.details}</Collapsible>
        </Modal>
      )}
      {showDialog && (
        <Modal
          title="Create"
          onDismiss={() => setShowDialog(false)}
          controls={["Close"]}
          onAction={() => {}}
          className="mh-75 mw-75"
          overflow
        >
          <CreateDialog />
        </Modal>
      )}
      <Header
        left={<InteractiveLogo />}
        center={<Brand size={2} fixed />}
        right={
          <a className="o-0p6" href="https://github.com/saurabh-prosoft/vap" target="_blank">
            <Button className="fs-0" icon="github" size={2} iconLeft accent="dark" fit />
          </a>
        }
        fixed
        dynamic
        reference={provideRef}
      />
      <main className={styles.main}>
        <section ref={refEl} className={styles.title}>
          <div className="d-flex flex-center">
            <h1 className={["mr-2", styles["title-name"]].join(" ")}>My Flows</h1>
            {openingDB && <Spinner accent="dark" size={2} />}
          </div>
          <div className={styles.controls}>
            <Button
              onClick={() => setShowDialog(true)}
              disabled={openingDB}
              icon="create"
              accent="dark"
              iconLeft
              size={1}
            >
              Create
            </Button>
            <Button
              onClick={() => handleImport()}
              disabled={openingDB}
              icon="import"
              accent="dark"
              iconLeft
              size={1}
            >
              Import
            </Button>
            <Button
              busy={refreshing}
              disabled={refreshing || openingDB}
              onClick={handleRefresh}
              size={1.2}
              icon="refresh"
              accent="dark"
              flat
              className="px-1"
            />
          </div>
        </section>
        <section className={styles.content}>
          <FlowList />
        </section>
      </main>
      <Footer left={<Footnote />} />
    </>
  );
};

export default Flows;
