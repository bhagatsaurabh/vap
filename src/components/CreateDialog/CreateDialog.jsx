import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Template from "../common/Template/Template";
import styles from "./CreateDialog.module.css";
import { getTemplates } from "@/store/actions/templates";
import Spinner from "../common/Spinner/Spinner";
import empty from "@/assets/images/empty.png";

const CreateDialog = () => {
  const [loadingTemps, setLoadingTemps] = useState(false);
  const dispatch = useDispatch();
  const templates = useSelector((state) => state.templates);
  const navigate = useNavigate();

  const fetchTemplates = async () => {
    setLoadingTemps(true);
    await dispatch(getTemplates());
    setLoadingTemps(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = (template) => {
    if (template.id === 0) {
      navigate(`/flows/temp`, { state: null });
    }
  };

  return (
    <div className={styles.createdialog}>
      <Template template={{ id: 0, name: "Empty Flow", img: empty }} onSelect={handleCreate} />
      {loadingTemps ? (
        <div className={styles.spinner}>
          <Spinner size={2} accent="dark" />
        </div>
      ) : (
        templates.map((template) => (
          <Template key={template.id} template={template} onSelect={handleCreate} />
        ))
      )}
    </div>
  );
};

export default CreateDialog;
