# Quick Start Guide

Get up and running with the Generic Form Auto-Fill in 5 minutes!

## 🚀 Quick Setup (3 steps)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Update Your Resume
Edit `resume.txt` with your information (or it will use the default resume).

### Step 3: Start Chrome with Debugging
```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile

# Linux
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=C:\tmp\chrome-profile
```

---

## 💡 Basic Usage

### Fill Any Form (Auto-detect Everything)
```bash
# 1. Navigate to a job application form in Chrome
# 2. Run the script
python auto_fill_cdp.py
```

That's it! The script will:
- ✅ Detect all form fields
- ✅ Extract data from your resume using AI
- ✅ Fill all matching fields
- ✅ Show you what was filled in the console

---

## ⚙️ Optional Configuration

### Set Company & Job Title (Better AI Results)
```javascript
// In Chrome DevTools Console (F12):
window.AUTO_FILL_CONFIG = {
    companyName: "Google",
    jobTitle: "Software Engineer"
};
```

### Add Custom Field Values
```javascript
window.AUTO_FILL_CONFIG = {
    customMappings: {
        "how did you hear about us": "LinkedIn",
        "referral": "John Smith"
    }
};
```

---

## 📋 What Gets Filled Automatically

The script intelligently fills these common fields:

| Category | Fields |
|----------|--------|
| **Personal** | Name, Email, Phone, Address, City, Country |
| **Professional** | LinkedIn, GitHub, Portfolio, Current Company |
| **Job-Specific** | Salary, Start Date, Experience, Skills |
| **Motivation** | Cover Letter, Why You Want to Work Here |
| **Preferences** | Work Setup (Remote/Hybrid/Onsite) |

---

## 🔍 Troubleshooting

### Script Not Working?
```bash
# Check if Chrome is running with debugging
python get_cdp_url.py
```

### Form Not Filling?
1. Open Chrome DevTools (F12)
2. Check the Console tab for error messages
3. Look for logs like "✅ Filled input: ..." to see what worked

### Need Help?
- Read `README.md` for detailed documentation
- Check `USAGE_EXAMPLES.md` for more examples
- Review `CHANGES.md` to understand how it works

---

## 🎯 Pro Tips

1. **Always review before submitting** - The AI is smart but not perfect
2. **Update resume.txt** - Keep it current for best results
3. **Use custom mappings** - For frequently asked unique questions
4. **Check the console** - See what fields were detected and filled
5. **Test on simple forms first** - Before using on important applications

---

## 📚 Next Steps

- **Customize**: Edit `resume.txt` with your information
- **Configure**: Set up `AUTO_FILL_CONFIG` for specific companies
- **Explore**: Read `USAGE_EXAMPLES.md` for advanced usage
- **Understand**: Check `CHANGES.md` to see how it works

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| "Connection refused" | Start Chrome with `--remote-debugging-port=9222` |
| "No resume data" | Create or update `resume.txt` |
| "API error" | Check internet connection |
| "Field not filled" | Add custom mapping for that field |

---

## ✅ Checklist

Before running the script, make sure:

- [ ] Python 3.7+ installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Chrome running with debugging port 9222
- [ ] `resume.txt` exists and has your data
- [ ] You're on a job application form page

---

## 🎉 Success!

If you see this in the console:
```
✅ Successfully filled 12 fields
✅ Form filling completed!
```

You're done! Review the filled data and submit when ready.

---

## 📞 Need More Help?

- **Full Documentation**: `README.md`
- **Usage Examples**: `USAGE_EXAMPLES.md`
- **Technical Details**: `CHANGES.md`
- **Test Script**: `python test_auto_fill.py`

Happy job hunting! 🚀

