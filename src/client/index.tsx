import "vite/modulepreload-polyfill";
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <h1>BinBox</h1>
  </React.StrictMode>,
);
