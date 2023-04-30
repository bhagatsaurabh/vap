import { RouterProvider } from "react-router-dom";

import router from "./router";
import "@/App.css";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: "media/set" });

    const listener = () => dispatch({ type: "media/set" });

    const match768 = matchMedia("(min-width: 768px)");
    const match1024 = matchMedia("(min-width: 1024px)");
    match768.addEventListener("change", listener);
    match1024.addEventListener("change", listener);

    return () => {
      match768.removeEventListener("change", listener);
      match1024.removeEventListener("change", listener);
    };
  }, []);

  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
