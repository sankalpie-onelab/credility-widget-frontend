import { widgetStore } from "./store";
import { callAadhaarAgent } from "./api";
import React from "react";
import { createRoot } from "react-dom/client";
import InlineWidget from "../InlineWidget";

window.DocumentValidator = {
  validateAadhaar: async (file) => {
    if (!file) {
      console.error("No file passed to validateAadhaar");
      return;
    }

    const task = {
      id: crypto.randomUUID(),
      type: "AADHAAR",
      status: "RUNNING",
      score: null,
      response: null
    };

    widgetStore.addTask(task);

    try {
      const res = await callAadhaarAgent(file);

      widgetStore.updateTask(task.id, {
        status: res.status.toUpperCase(),
        score: res.score,
        response: res
      });
    } catch (err) {
      widgetStore.updateTask(task.id, {
        status: "ERROR",
        response: err.message
      });
    }
  },
  // NEW: Render inline widget in a specific container
  renderInline: (containerId, options = {}) => {
    const container = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;

    if (!container) {
      console.error(`Container not found: ${containerId}`);
      return;
    }

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <InlineWidget store={widgetStore} />
      </React.StrictMode>
    );

    return root;
  }
};
