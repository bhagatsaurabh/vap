import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Template from "../common/Template/Template";
import styles from "./CreateDialog.module.css";
import { getTemplates } from "@/store/actions/templates";
import Spinner from "../common/Spinner/Spinner";
import empty from "@/assets/images/empty.png";
import { saveFlow } from "@/store/actions/db";

const CreateDialog = () => {
  const [loadingTemps, setLoadingTemps] = useState(false);
  const dispatch = useDispatch();
  const templates = useSelector((state) => state.templates);
  const navigate = useNavigate();
  const dbStatus = useSelector((state) => state.database.status);
  const [busy, setBusy] = useState(false);

  const fetchTemplates = async () => {
    setLoadingTemps(true);
    await dispatch(getTemplates());
    setLoadingTemps(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = async (template, blobUrl) => {
    if (template.id === 0) {
      if (dbStatus !== "open") {
        // 1. Empty Flow, Database Down, Internet Up/Down (Irrelevant)
        navigate(`/flows/temp`, { state: null });
      } else {
        // 2. Empty Flow, Database Up, Internet Up/Down (Irrelevant)
        // Save new empty flow in database and switch to Editor
        const result = await dispatch(
          saveFlow({ flow: null, preview: { name: "Untitled", img: null } })
        );
        if (result.payload) {
          navigate(`/flows/${result.payload}`);
        }
      }
    } else {
      if (dbStatus !== "open") {
        // 3. Template Flow, Internet Up, Database Down
        navigate(`/flows/temp`, { state: { url: blobUrl, name: template.name } });
      } else {
        // 4. Template Flow, Internet Up, Database Up
        // Save new template flow in database and switch to Editor
        const result = await dispatch(
          saveFlow({ flow: blobUrl, preview: { name: template.name, img: template.img } })
        );
        if (result.payload) {
          navigate(`/flows/${result.payload}`);
        }
      }
    }
  };

  return (
    <div className={styles.createdialog}>
      <Template
        template={{ id: 0, name: "Empty Flow", img: empty }}
        onBusy={(isBusy) => setBusy(isBusy)}
        onSelect={handleCreate}
        disabled={busy}
      />
      {loadingTemps ? (
        <div className={styles.spinner}>
          <Spinner size={2} accent="dark" />
        </div>
      ) : (
        templates.map((template) => (
          <Template
            key={template.id}
            template={template}
            onBusy={(isBusy) => setBusy(isBusy)}
            onSelect={handleCreate}
            disabled={busy}
          />
        ))
      )}
    </div>
  );
};

export default CreateDialog;
