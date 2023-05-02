import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Header from "@/components/Header/Header";
import styles from "./Flows.module.css";
import Footer from "@/components/Footer/Footer";
import InteractiveLogo from "@/components/common/InteractiveLogo/InteractiveLogo";
import Brand from "@/components/common/Brand/Brand";
import Button from "@/components/common/Button/Button";
import Footnote from "@/components/Footnote/Footnote";
import { initDatabase } from "@/store/actions/db";
import Spinner from "@/components/common/Spinner/Spinner";
import { fn } from "@/misc/utils";
import Collapsible from "@/components/common/Collapsible/Collapsible";
import Modal from "@/components/common/Modal/Modal";

const Flows = () => {
  const refEl = useRef(null);
  const provideRef = () => refEl.current;
  const dispatch = useDispatch();
  const [openingDB, setOpeningDB] = useState(false);
  const status = useSelector((state) => state.database.status);
  const error = useSelector((state) => state.database.error);

  const handleOpenDB = async () => {
    try {
      setOpeningDB(true);
      await dispatch(initDatabase());
    } finally {
      setOpeningDB(false);
    }
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
            <Button disabled={openingDB} icon="create" accent="dark" iconLeft size={1}>
              Create
            </Button>
            <Button disabled={openingDB} icon="import" accent="dark" iconLeft size={1}>
              Import
            </Button>
          </div>
        </section>
        <section></section>
      </main>
      <Footer left={<Footnote />} />
    </>
  );
};

export default Flows;
