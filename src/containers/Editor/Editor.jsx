import { useLocation, useParams } from "react-router-dom";

import styles from "./Editor.module.css";

const Editor = () => {
  const { id } = useParams();
  const location = useLocation();

  return <span>Editor {id}</span>;
};

export default Editor;
