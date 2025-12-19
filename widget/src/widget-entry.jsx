import React from "react";
import { createRoot } from "react-dom/client";
import WidgetApp from "./WidgetApp";
import { widgetStore } from "./widget/store";

// Create container dynamically (VERY IMPORTANT)
const container = document.createElement("div");
container.id = "document-validator-widget-root";
document.body.appendChild(container);

// Mount React
createRoot(container).render(
  <React.StrictMode>
    <WidgetApp store={widgetStore} />
  </React.StrictMode>
);

// Load controller LAST (exposes global API)
import "./widget/controller";
