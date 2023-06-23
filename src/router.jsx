import { createBrowserRouter } from "react-router-dom";
import Editor from "@/containers/Editor/Editor";
import Flows from "@/containers/Flows/Flows";
import Home from "@/containers/Home/Home";
import CrashBoard from "./components/CrashBoard/CrashBoard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <CrashBoard />,
  },
  {
    path: "/flows",
    element: <Flows />,
    errorElement: <CrashBoard />,
  },
  {
    path: "/flows/:id",
    element: <Editor />,
    errorElement: <CrashBoard />,
  },
]);

export default router;
