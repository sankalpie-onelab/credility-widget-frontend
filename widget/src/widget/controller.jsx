import { createWidgetStore } from "./store";
import { callAadhaarAgent } from "./api";
import React from "react";
import { createRoot } from "react-dom/client";
import InlineWidget from "../InlineWidget";

// Create a map to store widget instances
const widgetInstances = new Map();

// Simple auto-initialization function
function autoInitializeWidgets() {
  // Find all widget containers
  const widgetContainers = document.querySelectorAll('[data-widget-for]');
  
  widgetContainers.forEach(container => {
    const validatorId = container.getAttribute('data-widget-for');
    
    // Create and render widget
    const validator = DocumentValidator.createValidator(validatorId);
    validator.render();
    
    // Setup file name display
    const fileInput = document.querySelector(`[data-validator-id="${validatorId}"]`);
    if (fileInput) {
      const fileDisplay = document.querySelector(`[data-file-for="${fileInput.id}"]`);
      if (fileDisplay) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          fileDisplay.textContent = file ? "Selected: " + file.name : "";
        });
      }
    }
    
    // Setup button click
    const button = document.querySelector(`[data-validate-for="${fileInput?.id}"]`);
    if (button) {
      button.addEventListener('click', () => {
        const file = fileInput?.files[0];
        if (!file) {
          alert(`Please select a file for ${fileInput?.id || 'this document'}`);
          return;
        }
        validator.validateAadhaar(file);
      });
    }
  });
}

window.DocumentValidator = {
  // Method to create a new validator instance
  createValidator: (validatorId) => {
    // Check if already exists
    if (widgetInstances.has(validatorId)) {
      return widgetInstances.get(validatorId);
    }

    const store = createWidgetStore();
    
    const validator = {
      store,
      id: validatorId,
      
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
        const container = document.querySelector(`[data-widget-for="${validatorId}"]`);
        
        if (!container) {
          console.error(`Container not found for validator: ${validatorId}`);
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
        widgetInstances.delete(validatorId);
      }
    };

    // Store the instance
    widgetInstances.set(validatorId, validator);
    
    return validator;
  },

  // Auto-initialize all widgets on the page
  autoInitialize: autoInitializeWidgets,

  // Legacy method for backward compatibility
  validateAadhaar: async (file) => {
    // Use a default store if exists
    const defaultValidator = widgetInstances.get('default') || 
      DocumentValidator.createValidator('default');
    
    return defaultValidator.validateAadhaar(file);
  },

  renderInline: (containerId) => {
    const validator = DocumentValidator.createValidator(containerId);
    return validator.render();
  }
};