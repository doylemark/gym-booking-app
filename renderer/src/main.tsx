import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("React failed to mount, couldn't find container");
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
