import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import LazyApp from "./LazyApp.jsx";
import "./index.css";
import Loading from "./pages/Loading.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Suspense fallback={<Loading />}>
    <LazyApp />
  </Suspense>,
);
