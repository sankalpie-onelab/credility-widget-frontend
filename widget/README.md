# Document Validator Widget

A lightweight, embeddable widget for document validation using AI agents. Display validation status inline and track history across multiple agents.

## Features

- **Inline Validation:** Show validation status right next to your file inputs
- **Multi-Agent Support:** Use different validation agents for different document types
- **Separate States:** Each file upload maintains its own validation state
- **History Panel:** View validation logs and statistics for all agents
- **Zero Configuration:** Automatic setup with minimal HTML changes
- **Responsive:** Works with any existing form layout

## Quick Start

### 1. Load the Widget Library

Add this script to your page:

```html
<script src="https://cdn.your-domain.com/doc-validator-widget.js"></script>
```

### 2. Add Minimal HTML Structure

For each document upload field, add this snippet:

```html
<div class="form-row">
  <!-- File Input -->
  <div>
    <input 
      type="file" 
      accept=".pdf,.jpg,.jpeg,.png"
      data-agent-id="aadhar_card_validator_s5"  <!-- Change per document type -->
    />
    <div class="file-name"></div>  <!-- Optional: Shows selected filename -->
  </div>
  
  <!-- Validate Button -->
  <div>
    <button>Validate</button>
  </div>
  
  <!-- Widget Container -->
  <div>
    <div data-widget-for="unique-id-here"></div>
  </div>
</div>
```

### 3. Initialize

Add this script at the bottom of your page:

```html
<script>
  // Auto-initialize all widgets on page load
  document.addEventListener('DOMContentLoaded', () => {
    DocumentValidator.autoInitialize();
  });
</script>
```

That's it! The widget will automatically:

- Connect the file input, button, and widget in the same row
- Show file selection in the `.file-name` element
- Display validation status when clicked
- Track history for each agent

## Usage Examples

### Multiple Agents with Multiple Instances

```html
<!-- Aadhaar Card (Agent 1) -->
<div class="form-row">
  <div>
    <input type="file" data-agent-id="aadhar_card_validator_s5" />
    <div class="file-name"></div>
  </div>
  <div><button>Validate Aadhaar 1</button></div>
  <div><div data-widget-for="aadhaar-1"></div></div>
</div>

<!-- Another Aadhaar Card (Same Agent, Separate State) -->
<div class="form-row">
  <div>
    <input type="file" data-agent-id="aadhar_card_validator_s5" />
    <div class="file-name"></div>
  </div>
  <div><button>Validate Aadhaar 2</button></div>
  <div><div data-widget-for="aadhaar-2"></div></div>
</div>

<!-- PAN Card (Different Agent) -->
<div class="form-row">
  <div>
    <input type="file" data-agent-id="pan_card_validator_s2" />
    <div class="file-name"></div>
  </div>
  <div><button>Validate PAN</button></div>
  <div><div data-widget-for="pan-1"></div></div>
</div>

<!-- Driving License (Another Agent) -->
<div class="form-row">
  <div>
    <input type="file" data-agent-id="dl_validator_s1" />
    <div class="file-name"></div>
  </div>
  <div><button>Validate License</button></div>
  <div><div data-widget-for="license-1"></div></div>
</div>
```

**Key Points:**

- Same `data-agent-id` = same agent logic, but separate validation states
- Different `data-agent-id` = different validation agents
- Each `data-widget-for` must have a unique value

## History Panel

Click the purple bubble (bottom-right) to open the history panel where you can:

- Switch between different agents
- View validation statistics (pass/fail rates)
- See detailed logs for each validation
- View extracted data and validation reasons

## Integration with Existing Forms

The widget is designed to work with minimal changes to existing codebases:

**Before:**

```html
<!-- Your existing form -->
<div class="form-row">
  <input type="file" id="aadhaar" />
  <button onclick="validateFile()">Validate</button>
  <div id="status"></div>
</div>
```

**After:**

```html
<!-- Minimal changes needed -->
<div class="form-row">
  <input type="file" id="aadhaar" data-agent-id="aadhar_card_validator_s5" />
  <button>Validate</button>
  <div><div data-widget-for="aadhaar-validator"></div></div>
</div>
```

No need to change your button click handlers or status display logic!
