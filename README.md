# CDP Auto-Fill Script

A Python script that connects to an existing Chrome browser via Chrome DevTools Protocol (CDP) and automatically fills out **any form** using AI-powered field detection and data mapping.

## ✨ What's New (Generic AI-Powered Version)

**No more hardcoded forms!** The new `auto_fill_generic.js` uses artificial intelligence to:

- 🔍 **Automatically detect** all form fields on any webpage
- 🧠 **Understand field context** using AI analysis of labels and content
- 📝 **Generate personalized responses** based on your resume
- 🎯 **Work with any form** - job applications, surveys, contact forms, etc.
- ⚡ **Handle all field types** - text inputs, dropdowns, textareas, comboboxes

## Prerequisites

1. **Python 3.7+** installed
2. **Chrome browser** running with remote debugging enabled
3. **Required Python packages** (install with pip)

## Installation

```bash
pip install -r requirements.txt
```

## Setup Chrome for CDP

### Method 1: Start Chrome with remote debugging

```bash
# Linux/Mac
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=C:\tmp\chrome-profile
```

### Method 2: Use existing Chrome instance

1. Open Chrome normally
2. Go to `chrome://inspect/#devices`
3. Copy the WebSocket URL (starts with `ws://localhost:9222/devtools/browser/...`)

## Usage

### Basic usage (with defaults):

```bash
python auto_fill_cdp.py
```

### Custom CDP URL and form URL:

```bash
python auto_fill_cdp.py "ws://localhost:9222/devtools/browser/YOUR_SESSION_ID" "https://your-form-url.com"
```

### Examples:

```bash
# Use default settings
python auto_fill_cdp.py

# Specify custom CDP URL
python auto_fill_cdp.py "ws://localhost:9222/devtools/browser/abc123"

# Specify both CDP URL and form URL
python auto_fill_cdp.py "ws://localhost:9222/devtools/browser/abc123" "https://example.com/form"
```

## How it works

1. **Connects** to Chrome via CDP WebSocket
2. **Navigates** to the specified form URL (optional)
3. **Dynamically parses** all form fields on the page (inputs, selects, textareas, dropdowns)
4. **Analyzes** field labels using AI to understand what each field requires
5. **Maps** resume data to appropriate form fields using ModelScope AI API
6. **Fills** each field with personalized, contextually appropriate data
7. **Dispatches** proper DOM events to ensure form validation

## AI-Powered Form Detection

The script now uses **artificial intelligence** to:
- **Parse any form structure** - no hardcoded field names or company-specific logic
- **Understand field context** - analyzes labels, placeholders, and aria attributes
- **Map resume data intelligently** - fills name fields with names, contact fields with contact info, etc.
- **Generate contextual responses** - creates personalized motivation letters and answers

## Dynamic Data Mapping

The AI analyzes your resume and fills **any form field** with contextually appropriate data:

- **Personal Information**: Name, phone, email, LinkedIn from your resume
- **Location Data**: Country, city, address from your resume
- **Professional Details**: Salary expectations, start dates, experience level
- **Motivation/Responses**: AI-generated personalized responses explaining your interest and qualifications
- **Dropdown Selections**: Intelligent selection from available options based on your profile
- **Custom Fields**: Any field type is supported - text inputs, textareas, selects, comboboxes, contenteditable elements

## Files Included

- `auto_fill_cdp.py` - Main Python script for CDP communication
- `auto_fill_generic.js` - AI-powered generic form filler (works with any form)
- `get_cdp_url.py` - Helper script to find CDP WebSocket URLs
- `test_auto_fill.py` - Test script for the auto-fill functionality
- `resume.txt` - Resume data used by the AI for form filling
- `requirements.txt` - Python dependencies
- `README.md` - This documentation

## Customization

- **Resume Data**: Edit `resume.txt` to update the information used for form filling
- **AI Prompts**: Modify the LLM prompts in `auto_fill_generic.js` for different behavior
- **Field Detection**: Customize field parsing logic in the `parseFormFields()` function
- **Fallback Data**: Update the fallback values in the script for when AI is unavailable

## Troubleshooting

### Connection Issues
- Make sure Chrome is running with `--remote-debugging-port=9222`
- Check that the WebSocket URL is correct
- Ensure no firewall is blocking the connection

### Form Not Filling
- Verify you're on the correct page
- Check that the form fields match the expected label patterns
- Some forms may have anti-automation measures

### Script Errors
- Check Python version (3.7+ required)
- Ensure all dependencies are installed
- Look at Chrome DevTools console for JavaScript errors

## Security Note

This script is for educational and testing purposes. Be respectful of websites' terms of service and only use for forms you have permission to fill.
