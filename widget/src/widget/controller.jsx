import { createWidgetStore } from "./store";
import { callValidationAgent } from "./api";
import React from "react";
import { createRoot } from "react-dom/client";
import InlineWidget from "../InlineWidget";

// Create a map to store widget instances
const widgetInstances = new Map();

// Enhanced auto-initialization that finds elements by DOM structure
function autoInitializeWidgets() {
  // Find all widget containers
  const widgetContainers = document.querySelectorAll('[data-widget-for]');
  
  widgetContainers.forEach(container => {
    const validatorId = container.getAttribute('data-widget-for');
    
    // Find related elements using DOM traversal instead of data attributes
    const formRow = container.closest('.form-row');
    if (!formRow) return;
    
    // Find file input in the same row
    const fileInput = formRow.querySelector('input[type="file"]');
    if (!fileInput) return;
    
    // Get agent ID from input or use default
    const agentId = fileInput.getAttribute('data-agent-id') || 'aadhar_card_validator_s5';
    
    // Find file display element
    const fileDisplay = formRow.querySelector('.file-name');
    
    // Find validate button in the same row
    const button = formRow.querySelector('button.btn, button[type="button"], button');
    
    // Create and render widget
    const validator = DocumentValidator.createValidator(validatorId, agentId);
    validator.render();
    
    // Setup file name display
    if (fileDisplay) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        fileDisplay.textContent = file ? "Selected: " + file.name : "";
      });
    }
    
    // Setup button click
    if (button) {
      button.addEventListener('click', () => {
        const file = fileInput?.files[0];
        if (!file) {
          alert(`Please select a file`);
          return;
        }
        validator.validate(file);
      });
    }
  });
}

window.DocumentValidator = {
  // Method to create a new validator instance
  createValidator: (validatorId, agentId = 'aadhar_card_validator_s5') => {
    // Check if already exists
    if (widgetInstances.has(validatorId)) {
      return widgetInstances.get(validatorId);
    }

    const store = createWidgetStore();
    
    const validator = {
      store,
      id: validatorId,
      agentId: agentId,
      
      validate: async (file) => {
        if (!file) {
          console.error("No file passed to validate");
          return;
        }

        const task = {
          id: crypto.randomUUID(),
          type: validator.agentId.toUpperCase(),
          status: "RUNNING",
          score: null,
          response: null,
          fileName: file.name
        };

        store.addTask(task);

        try {
          const res = await callValidationAgent(file, validator.agentId);

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
  validate: async (file, agentId = 'aadhar_card_validator_s5') => {
    const defaultValidator = widgetInstances.get('default') || 
      DocumentValidator.createValidator('default', agentId);
    
    return defaultValidator.validate(file);
  },

  renderInline: (containerId, agentId = 'aadhar_card_validator_s5') => {
    const validator = DocumentValidator.createValidator(containerId, agentId);
    return validator.render();
  }
};