import { createBrowserRouter } from "react-router-dom";
import Editor from "@/containers/Editor/Editor";
import Flows from "@/containers/Flows/Flows";
import Home from "@/containers/Home/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/flows",
    element: <Flows />,
  },
  {
    path: "/editor/:id",
    element: <Editor />,
  },
]);

export default router;
