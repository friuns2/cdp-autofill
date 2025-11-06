# Generic AI-Powered Form Auto-Fill Script

An intelligent Python script that connects to Chrome via Chrome DevTools Protocol (CDP) and automatically fills out **any** job application form using AI to extract data from your resume. The script uses ModelScope's Qwen AI to intelligently match resume data to form fields.

## Features

✨ **Generic & Intelligent**: Works with any job application form - no hardcoding required  
🤖 **AI-Powered**: Uses ModelScope Qwen AI to extract and match resume data to form fields  
🔍 **Smart Detection**: Automatically detects all form fields (inputs, textareas, selects, comboboxes, contenteditable)  
🎯 **Flexible Matching**: Intelligently matches resume data to form fields based on labels, placeholders, and context  
⚙️ **Configurable**: Supports custom company names, job titles, and field mappings  
📝 **Resume-Based**: Extracts data from your resume/LinkedIn profile automatically

## Prerequisites

1. **Python 3.7+** installed
2. **Chrome browser** running with remote debugging enabled
3. **Required Python packages** (install with pip)
4. **ModelScope API Key** (included in the script)

## Installation

```bash
pip install -r requirements.txt
```

## Setup Chrome for CDP

### Method 1: Start Chrome with remote debugging

```bash
# Linux/Mac
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile

# macOS (if google-chrome doesn't work)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=C:\tmp\chrome-profile
```

### Method 2: Use existing Chrome instance

1. Open Chrome normally
2. Go to `chrome://inspect/#devices`
3. Copy the WebSocket URL (starts with `ws://localhost:9222/devtools/browser/...`)

## Usage

### Basic Usage (with defaults):

```bash
python auto_fill_cdp.py
```

The script will:
1. Connect to Chrome via CDP
2. Analyze the current form on the page
3. Extract data from `resume.txt` (or embedded resume data)
4. Use AI to intelligently match resume data to form fields
5. Fill all detected fields automatically

### Custom CDP URL and Form URL:

```bash
python auto_fill_cdp.py "ws://localhost:9222/devtools/browser/YOUR_SESSION_ID" "https://your-form-url.com"
```

### Advanced Configuration:

You can configure the auto-fill behavior by setting `window.AUTO_FILL_CONFIG` before running the script:

```javascript
window.AUTO_FILL_CONFIG = {
    companyName: "Google",           // Override auto-detected company name
    jobTitle: "Software Engineer",   // Override auto-detected job title
    resumeData: "Your resume text...", // Provide resume data directly
    preferredWorkSetup: "remote",    // Options: "remote", "hybrid", "onsite"
    customMappings: {                // Custom field mappings
        "referral": "LinkedIn",
        "how did you hear": "Company website"
    }
};
```

### Providing Resume Data:

The script looks for resume data in this order:

1. `window.AUTO_FILL_CONFIG.resumeData`
2. `window.RESUME_DATA`
3. Fetches from `/resume.txt`
4. Falls back to embedded default resume

## How It Works

1. **Form Analysis**: Automatically detects all fillable fields on the page
   - Input fields (text, email, tel, url, date)
   - Textareas
   - Select dropdowns
   - Custom comboboxes (role="combobox")
   - Contenteditable fields

2. **AI Extraction**: Sends resume and form field information to ModelScope AI
   - Analyzes resume content
   - Extracts relevant information (name, email, phone, skills, experience, etc.)
   - Generates personalized motivation letters based on company and job title
   - Matches data to detected form fields

3. **Intelligent Filling**: Fills fields using multiple strategies
   - Pattern matching (email, phone, linkedin, etc.)
   - Custom mappings (user-defined)
   - AI-suggested values
   - Handles different field types appropriately

4. **Event Dispatching**: Triggers proper DOM events to ensure form validation

## Supported Field Types

The script intelligently detects and fills:

- **Personal Info**: Name, email, phone, address, city, country, zip code
- **Professional**: LinkedIn, GitHub, portfolio, current company, current title
- **Job-Specific**: Salary expectations, start date, years of experience, skills
- **Motivation**: Cover letters, motivation statements, "why do you want to work here"
- **Dropdowns**: Work setup (remote/hybrid/onsite), job roles, education level
- **Custom Fields**: Any field with a recognizable label or placeholder

## Files Included

- `auto_fill_cdp.py` - Main Python script for CDP communication
- `auto_fill.js` - **Generic** JavaScript file with AI-powered auto-fill logic
- `get_cdp_url.py` - Helper script to find CDP WebSocket URLs
- `test_auto_fill.py` - Test script for the auto-fill functionality
- `resume.txt` - Your resume data (customize this!)
- `requirements.txt` - Python dependencies
- `README.md` - This documentation

## Customization

### Updating Your Resume

Edit `resume.txt` with your own resume data. The AI will extract relevant information automatically.

### Custom Field Mappings

For fields that aren't automatically detected, add custom mappings:

```javascript
window.AUTO_FILL_CONFIG = {
    customMappings: {
        "how did you hear about us": "LinkedIn",
        "referral source": "Company Career Page",
        "preferred start date": "Immediately"
    }
};
```

### Modifying AI Behavior

Edit the `auto_fill.js` file to customize:
- Field detection patterns (line ~295-318)
- AI prompt structure (line ~139-170)
- Field matching logic (line ~280-338)

## Troubleshooting

### Connection Issues
- Make sure Chrome is running with `--remote-debugging-port=9222`
- Check that the WebSocket URL is correct using `python get_cdp_url.py`
- Ensure no firewall is blocking the connection

### Form Not Filling
- Check Chrome DevTools console for error messages
- Verify resume data is available (check `resume.txt` or `window.RESUME_DATA`)
- Some forms may have anti-automation measures or unusual field structures
- Try adding custom mappings for fields that aren't auto-detected

### AI Extraction Issues
- Ensure ModelScope API is accessible (check your internet connection)
- Verify the API key is valid in `auto_fill.js`
- Check the console for AI response errors
- Resume data should be in plain text format

### Script Errors
- Check Python version (3.7+ required)
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Look at Chrome DevTools console for JavaScript errors
- Use `python test_auto_fill.py` to test the script

## Examples

### Example 1: Fill a job application form

```bash
# 1. Start Chrome with debugging
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile

# 2. Navigate to the job application form in Chrome

# 3. Run the script
python auto_fill_cdp.py
```

### Example 2: Custom configuration

```python
# In Chrome DevTools Console, before running the script:
window.AUTO_FILL_CONFIG = {
    companyName: "Tesla",
    jobTitle: "Senior Software Engineer",
    preferredWorkSetup: "hybrid",
    customMappings: {
        "referral": "Employee referral - John Smith",
        "notice period": "2 weeks"
    }
};
```

### Example 3: Using your own resume

```bash
# Edit resume.txt with your information
nano resume.txt

# Run the script
python auto_fill_cdp.py
```

## Security & Privacy

⚠️ **Important Notes:**
- This script is for **educational and personal use only**
- Your resume data is sent to ModelScope AI API for processing
- The API key is embedded in the script (consider using environment variables for production)
- Be respectful of websites' terms of service
- Only use on forms you have permission to fill
- Review all filled data before submitting any form

## License

This project is for educational purposes. Use responsibly and ethically.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.
