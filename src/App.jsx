import { RouterProvider } from "react-router-dom";

import router from "./router";
import "@/App.css";

const App = () => {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
