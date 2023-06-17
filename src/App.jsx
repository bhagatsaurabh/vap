import { RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import router from "./router";
import "@/App.css";
import { closeDatabase } from "./misc/db";
import Toast from "./components/common/Toast/Toast";
import { FlowConnectContext } from "./contexts/flow-connect";

const App = () => {
  const dispatch = useDispatch();
  const [flowConnect, setFlowConnect] = useState(null);
  const context = { flowConnect, setFlowConnect };

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
      closeDatabase();
    };
  }, []);

  return (
    <div className="app">
      <FlowConnectContext.Provider value={context}>
        <Toast />
        <RouterProvider router={router} />
      </FlowConnectContext.Provider>
    </div>
  );
};

export default App;
