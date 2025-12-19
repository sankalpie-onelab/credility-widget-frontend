import { createWidgetStore } from "./store";
import { callAadhaarAgent } from "./api";
import React from "react";
import { createRoot } from "react-dom/client";
import InlineWidget from "../InlineWidget";

// Create a map to store widget instances by container ID
const widgetInstances = new Map();

window.DocumentValidator = {
  // Method to create a new validator instance
  createValidator: (containerId, options = {}) => {
    // Check if already exists
    if (widgetInstances.has(containerId)) {
      console.warn(`Widget already exists for container: ${containerId}`);
      return widgetInstances.get(containerId);
    }

    const store = createWidgetStore();
    
    const validator = {
      store,
      
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
          response: null,
          // Add file name for display
          fileName: file.name
        };

        store.addTask(task);

        try {
          const res = await callAadhaarAgent(file);

          store.updateTask(task.id, {
            status: res.status.toUpperCase(),
            score: res.score,
            response: res
          });
        } catch (err) {
          store.updateTask(task.id, {
            status: "ERROR",
            response: err.message
          });
        }
      },

      // Render the widget
      render: () => {
        const container = typeof containerId === 'string'
          ? document.getElementById(containerId)
          : containerId;

        if (!container) {
          console.error(`Container not found: ${containerId}`);
          return null;
        }

        // Clear container
        container.innerHTML = '';
        
        const root = createRoot(container);
        root.render(
          <React.StrictMode>
            <InlineWidget store={store} />
          </React.StrictMode>
        );

        validator.root = root;
        return root;
      },

      // Cleanup method
      destroy: () => {
        if (validator.root) {
          validator.root.unmount();
        }
        widgetInstances.delete(containerId);
      }
    };

    // Store the instance
    widgetInstances.set(containerId, validator);
    
    return validator;
  },

  // Legacy method for single widget (for backward compatibility)
  validateAadhaar: async (file) => {
    // Use a default store if exists
    const defaultValidator = widgetInstances.get('default') || 
      window.DocumentValidator.createValidator('default');
    
    return defaultValidator.validateAadhaar(file);
  },

  renderInline: (containerId) => {
    const validator = window.DocumentValidator.createValidator(containerId);
    return validator.render();
  }
};