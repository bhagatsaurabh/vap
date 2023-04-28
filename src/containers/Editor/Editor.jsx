import { useParams } from "react-router-dom";

const Editor = () => {
  const { id } = useParams();

  return <span>Editor {id}</span>;
};

export default Editor;
