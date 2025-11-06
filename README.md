# CDP Auto-Fill Script

A Python script that connects to an existing Chrome browser via Chrome DevTools Protocol (CDP) and automatically fills out forms using `document.execCommand()`.

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
3. **Identifies** form fields by their labels
4. **Fills** each field using `document.execCommand()`:
   - `selectAll` - selects existing text
   - `delete` - removes selected text
   - `insertText` - inserts new mock data
5. **Dispatches** proper DOM events to ensure form validation

## Mock Data Filled

The script fills the following fields with realistic mock data:

- **Name & Last name**: "John Doe"
- **Phone**: "+1 555-123-4567"
- **Email**: "john.doe@email.com"
- **LinkedIn**: "https://www.linkedin.com/in/john-doe-123456"
- **Country**: "United States"
- **City**: "San Francisco"
- **Salary**: "$8,000 USD"
- **Start Date**: "01/15/2025"
- **Motivation**: Detailed motivation text about WasteHero

## Customization

To modify the mock data or form field detection logic, edit the JavaScript code in the `execute_auto_fill_script()` method.

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
