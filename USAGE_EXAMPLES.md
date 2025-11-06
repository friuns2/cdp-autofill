# Usage Examples for Generic Form Auto-Fill

This document provides practical examples of how to use the generic form auto-fill script with different scenarios.

## Example 1: Basic Usage - Auto-detect Everything

The simplest way to use the script. It will auto-detect the company name, job title, and form fields.

```bash
# 1. Start Chrome with debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile

# 2. Navigate to any job application form

# 3. Run the script
python auto_fill_cdp.py
```

**What happens:**
- Script analyzes all form fields on the page
- Extracts data from `resume.txt`
- AI auto-detects company name from page metadata/title
- AI auto-detects job title from page content
- Fills all matching fields automatically

---

## Example 2: Specify Company and Job Title

For better AI-generated motivation letters, specify the company and job title.

```javascript
// In Chrome DevTools Console (F12), run this BEFORE the Python script:
window.AUTO_FILL_CONFIG = {
    companyName: "Google",
    jobTitle: "Senior Software Engineer"
};
```

Then run:
```bash
python auto_fill_cdp.py
```

**What happens:**
- AI generates a personalized motivation letter mentioning Google and Senior Software Engineer role
- All other fields are filled automatically based on resume

---

## Example 3: Custom Field Mappings

Some forms have unique fields that need specific answers.

```javascript
// In Chrome DevTools Console:
window.AUTO_FILL_CONFIG = {
    companyName: "Tesla",
    jobTitle: "Software Engineer",
    customMappings: {
        "how did you hear about us": "LinkedIn job posting",
        "referral": "John Smith - Engineering Manager",
        "are you authorized to work": "Yes",
        "notice period": "2 weeks",
        "willing to relocate": "Yes"
    }
};
```

**What happens:**
- Fields matching the custom mapping keys will be filled with specified values
- Other fields are filled from resume data
- Custom mappings take priority over AI-extracted data

---

## Example 4: Provide Resume Data Directly

If you don't have a `resume.txt` file or want to use different resume data:

```javascript
// In Chrome DevTools Console:
window.AUTO_FILL_CONFIG = {
    resumeData: `
John Smith
Senior Software Engineer
Email: john@example.com
Phone: +1-555-123-4567
LinkedIn: https://linkedin.com/in/johnsmith

Experience:
- 5 years at Google as Software Engineer
- 3 years at Microsoft as Junior Developer

Skills: Python, JavaScript, React, Node.js, AWS
Education: BS Computer Science, MIT
    `,
    companyName: "Amazon",
    jobTitle: "Senior SDE"
};
```

**What happens:**
- Script uses the provided resume data instead of fetching from file
- AI extracts relevant information from the inline resume text

---

## Example 5: Preferred Work Setup

Specify your preferred work arrangement for forms that ask about it:

```javascript
window.AUTO_FILL_CONFIG = {
    preferredWorkSetup: "remote"  // Options: "remote", "hybrid", "onsite"
};
```

**What happens:**
- When the form has a work setup dropdown, it will automatically select your preference

---

## Example 6: Fill Multiple Forms in Sequence

For applying to multiple positions at once:

```python
# Create a Python script: batch_apply.py
import subprocess
import time

forms = [
    "https://company1.com/apply",
    "https://company2.com/apply",
    "https://company3.com/apply"
]

for form_url in forms:
    print(f"Filling form: {form_url}")
    subprocess.run(["python", "auto_fill_cdp.py", "ws://localhost:9222/devtools/browser/YOUR_CDP_URL", form_url])
    time.sleep(5)  # Wait between forms
    print("Form filled! Please review and submit manually.")
    input("Press Enter to continue to next form...")
```

---

## Example 7: Debug Mode - See What's Happening

To understand what the script is doing:

```bash
# Run the script and watch Chrome DevTools Console (F12)
python auto_fill_cdp.py
```

**Console output shows:**
```
🔍 Analyzing form structure...
📋 Detected 12 form fields
📝 Extracting data from resume using AI...
✅ Extracted data: {name: "Igor Levochkin", email: "..."}
📝 Filling form fields...
✅ Filled input: Full Name = Igor Levochkin
✅ Filled input: Email = igor@igor.ink
✅ Filled input: Phone = +358 50 123 4567
...
✅ Successfully filled 12 fields
```

---

## Example 8: Handle Difficult Forms

Some forms have unusual structures. Use custom mappings and manual intervention:

```javascript
window.AUTO_FILL_CONFIG = {
    companyName: "Startup Inc",
    jobTitle: "Full Stack Developer",
    customMappings: {
        // Map exact field labels to values
        "Years of Experience": "8",
        "Expected Salary Range": "$120,000 - $150,000",
        "Portfolio URL": "https://myportfolio.com",
        "GitHub Profile": "https://github.com/myusername"
    }
};
```

Then run the script and manually fill any remaining fields that weren't auto-detected.

---

## Example 9: Different Resume for Different Jobs

Use different resume data for different types of positions:

```javascript
// For a Data Science position
window.AUTO_FILL_CONFIG = {
    resumeData: `... resume emphasizing ML/AI experience ...`,
    companyName: "DataCorp",
    jobTitle: "Senior Data Scientist"
};

// For a Frontend position
window.AUTO_FILL_CONFIG = {
    resumeData: `... resume emphasizing React/UI experience ...`,
    companyName: "WebCompany",
    jobTitle: "Senior Frontend Engineer"
};
```

---

## Example 10: Testing Without Submitting

To test the script without actually submitting forms:

```bash
# 1. Open a test form or create a local HTML form
# 2. Run the script
python auto_fill_cdp.py

# 3. Review all filled fields in the browser
# 4. Don't click submit - just verify the data is correct
# 5. Refresh the page to clear and test again
```

---

## Tips for Best Results

1. **Update resume.txt regularly** with your latest experience
2. **Use specific company and job titles** for better motivation letters
3. **Add custom mappings** for frequently asked unique questions
4. **Review before submitting** - always verify the filled data
5. **Check console logs** to see what fields were detected and filled
6. **Test on simple forms first** before using on important applications

---

## Common Field Patterns Detected

The script automatically recognizes these field patterns:

| Field Type | Detected Patterns |
|------------|------------------|
| Name | "full name", "your name", "first and last name" |
| Email | "email", "e-mail", "email address" |
| Phone | "phone", "mobile", "telephone", "contact number" |
| LinkedIn | "linkedin", "linked in profile" |
| GitHub | "github", "git hub profile" |
| City | "city", "town", "location" |
| Country | "country", "nation" |
| Salary | "salary", "compensation", "expected pay" |
| Start Date | "start date", "available", "availability" |
| Motivation | "why do you want", "cover letter", "tell us why" |
| Experience | "years of experience", "work experience" |
| Skills | "skills", "technologies", "expertise" |

If your form uses different wording, add custom mappings!

