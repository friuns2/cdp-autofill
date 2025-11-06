// Generic Auto-fill script for any Job Application form
// Uses ModelScope API to intelligently extract data from resume and fill form fields

// ModelScope API configuration
const MODEL_SCOPE_CONFIG = {
    apiKey: "ms-af1bbcd8-400f-4b00-907d-96924da90955",
    baseUrl: "https://api-inference.modelscope.cn/v1",
    model: "Qwen/Qwen3-Coder-480B-A35B-Instruct"
};

// Configuration - can be set externally via window.AUTO_FILL_CONFIG
const AUTO_FILL_CONFIG = window.AUTO_FILL_CONFIG || {
    companyName: null,  // Will be auto-detected or use default
    jobTitle: null,     // Will be auto-detected or use default
    resumeData: null,   // Resume text
    preferredWorkSetup: "remote",  // Options: "remote", "hybrid", "onsite"
    customMappings: {}  // Custom field mappings: { "fieldLabel": "value" }
};

// Resume data - can be set externally or fetched
let resumeData = AUTO_FILL_CONFIG.resumeData || window.RESUME_DATA || null;

// Function to analyze form and detect all fillable fields
function analyzeForm() {
    const formFields = [];
    
    // Detect all input fields
    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], input[type="url"], input[type="date"], textarea');
    inputs.forEach(input => {
        const fieldInfo = getFieldInfo(input);
        if (fieldInfo) {
            formFields.push(fieldInfo);
        }
    });
    
    // Detect contenteditable fields
    const contentEditables = document.querySelectorAll('[contenteditable="plaintext-only"], [contenteditable="true"], [role="textbox"]');
    contentEditables.forEach(editable => {
        const fieldInfo = getFieldInfo(editable);
        if (fieldInfo) {
            formFields.push(fieldInfo);
        }
    });
    
    // Detect select dropdowns
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        const fieldInfo = getFieldInfo(select);
        if (fieldInfo) {
            fieldInfo.options = Array.from(select.options).map(opt => ({
                value: opt.value,
                text: opt.text
            }));
            formFields.push(fieldInfo);
        }
    });
    
    // Detect combobox/custom dropdowns
    const comboboxes = document.querySelectorAll('[role="combobox"], [data-testid*="combobox"]');
    comboboxes.forEach(combo => {
        const fieldInfo = getFieldInfo(combo);
        if (fieldInfo) {
            formFields.push(fieldInfo);
        }
    });
    
    return formFields;
}

// Helper function to extract field information
function getFieldInfo(element) {
    let labelText = '';
    let placeholder = element.placeholder || '';
    let ariaLabel = element.getAttribute('aria-label') || '';
    let ariaLabelledBy = element.getAttribute('aria-labelledby');
    
    // Try to find label by aria-labelledby
    if (ariaLabelledBy) {
        const labelElement = document.getElementById(ariaLabelledBy);
        if (labelElement) {
            labelText = labelElement.textContent?.trim() || '';
        }
    }
    
    // Walk up the DOM to find labels
    if (!labelText) {
        let parent = element;
        for (let i = 0; i < 10; i++) {
            parent = parent.parentElement;
            if (!parent) break;
            
            const labels = parent.querySelectorAll('p, span, div, label, [data-testid*="label"]');
            for (let label of labels) {
                const text = label.textContent?.trim() || '';
                if (text && text.length > 2 && !text.includes('*') && !text.includes('Please include')) {
                    labelText = text;
                    break;
                }
            }
            if (labelText) break;
        }
    }
    
    // Use aria-label as fallback
    if (!labelText && ariaLabel) {
        labelText = ariaLabel;
    }
    
    return {
        element: element,
        label: labelText,
        placeholder: placeholder,
        type: element.tagName.toLowerCase(),
        inputType: element.type || element.getAttribute('role') || '',
        name: element.name || '',
        id: element.id || ''
    };
}

// Function to call ModelScope API with dynamic form fields
async function getFormDataFromResume(resumeText, formFields, companyName = null, jobTitle = null) {
    // Auto-detect company name and job title from page if not provided
    if (!companyName) {
        companyName = detectCompanyName() || "this company";
    }
    if (!jobTitle) {
        jobTitle = detectJobTitle() || "this position";
    }
    
    // Build field descriptions for the AI
    const fieldDescriptions = formFields.map((field, index) => {
        let desc = `Field ${index + 1}: ${field.label || field.placeholder || field.name || 'Unknown field'}`;
        if (field.options) {
            desc += ` (Options: ${field.options.map(o => o.text).join(', ')})`;
        }
        return desc;
    }).join('\n');
    
    const prompt = `You are extracting information from a resume/LinkedIn profile to fill out a job application form.

RESUME/LINKEDIN PROFILE:
${resumeText}

COMPANY: ${companyName}
JOB TITLE: ${jobTitle}

FORM FIELDS DETECTED:
${fieldDescriptions}

Please analyze the form fields and extract relevant information from the resume. Return ONLY a valid JSON object where:
- Keys are descriptive field identifiers (e.g., "fullName", "email", "phone", "linkedin", "city", "country", "salary", "startDate", "motivation", "coverLetter", "portfolio", "github", "website", "yearsOfExperience", "skills", "education", "currentCompany", "currentTitle", "workAuthorization", "preferredWorkSetup", etc.)
- Values are the extracted data from the resume
- For motivation/cover letter fields, write a compelling 2-3 sentence personalized message explaining why the candidate wants to work with ${companyName} as ${jobTitle}, highlighting relevant experience
- For dropdown fields with options, return the most appropriate option value
- Use reasonable defaults for missing information based on the profile
- Return ONLY the JSON object, no additional text or markdown formatting

Example format:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1 234 567 8900",
  "linkedin": "https://linkedin.com/in/johndoe",
  "city": "San Francisco",
  "country": "United States",
  "motivation": "Personalized motivation text...",
  "skills": "JavaScript, Python, React",
  "yearsOfExperience": "5",
  "currentTitle": "Senior Developer"
}`;

    try {
        const response = await fetch(`${MODEL_SCOPE_CONFIG.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MODEL_SCOPE_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: MODEL_SCOPE_CONFIG.model,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Extract JSON from response (handle markdown code blocks if present)
        let jsonStr = content;
        if (content.includes('```json')) {
            jsonStr = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonStr = content.split('```')[1].split('```')[0].trim();
        }
        
        const formData = JSON.parse(jsonStr);
        return formData;
    } catch (error) {
        console.error('Error calling ModelScope API:', error);
        throw error;
    }
}

// Helper function to detect company name from page
function detectCompanyName() {
    // Try common selectors for company name
    const selectors = [
        'meta[property="og:site_name"]',
        'meta[name="application-name"]',
        '[class*="company-name"]',
        '[class*="employer"]',
        'h1', 'h2'
    ];
    
    for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            const content = element.getAttribute('content') || element.textContent;
            if (content && content.trim().length > 0 && content.trim().length < 50) {
                return content.trim();
            }
        }
    }
    
    // Try to extract from page title
    const title = document.title;
    if (title) {
        const parts = title.split(/[-|–]/);
        if (parts.length > 1) {
            return parts[parts.length - 1].trim();
        }
    }
    
    return null;
}

// Helper function to detect job title from page
function detectJobTitle() {
    // Try common selectors for job title
    const selectors = [
        '[class*="job-title"]',
        '[class*="position"]',
        '[class*="role"]',
        'h1', 'h2'
    ];
    
    for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            const text = element.textContent?.trim();
            if (text && text.length > 0 && text.length < 100 && 
                (text.toLowerCase().includes('engineer') || 
                 text.toLowerCase().includes('developer') ||
                 text.toLowerCase().includes('manager') ||
                 text.toLowerCase().includes('designer') ||
                 text.toLowerCase().includes('analyst'))) {
                return text;
            }
        }
    }
    
    return null;
}

// Initialize form data (will be populated after API call)
let extractedData = null;

// Intelligent field matching function
function matchFieldToData(fieldInfo, data) {
    const label = (fieldInfo.label || '').toLowerCase();
    const placeholder = (fieldInfo.placeholder || '').toLowerCase();
    const combined = label + ' ' + placeholder;
    
    // Check custom mappings first
    if (AUTO_FILL_CONFIG.customMappings) {
        for (let [key, value] of Object.entries(AUTO_FILL_CONFIG.customMappings)) {
            if (combined.includes(key.toLowerCase())) {
                return value;
            }
        }
    }
    
    // Intelligent matching based on field labels/placeholders
    const patterns = {
        fullName: ['full name', 'your name', 'name', 'first and last'],
        firstName: ['first name', 'given name'],
        lastName: ['last name', 'surname', 'family name'],
        email: ['email', 'e-mail'],
        phone: ['phone', 'mobile', 'telephone', 'contact number', 'country code'],
        linkedin: ['linkedin', 'linked in'],
        github: ['github', 'git hub'],
        portfolio: ['portfolio', 'website', 'personal site'],
        city: ['city', 'town'],
        country: ['country', 'nation'],
        address: ['address', 'street'],
        zipCode: ['zip', 'postal code', 'postcode'],
        salary: ['salary', 'compensation', 'expected pay', 'salary expectation'],
        startDate: ['start date', 'available', 'availability', 'when can you start', 'mm/dd/yyyy'],
        motivation: ['motivation', 'why do you want', 'why are you interested', 'cover letter', 'tell us why'],
        experience: ['years of experience', 'experience', 'work experience'],
        education: ['education', 'degree', 'university', 'school'],
        skills: ['skills', 'technologies', 'expertise'],
        currentCompany: ['current company', 'current employer', 'where do you work'],
        currentTitle: ['current title', 'current position', 'current role'],
        referral: ['how did you hear', 'referral', 'how did you find'],
        workAuthorization: ['work authorization', 'authorized to work', 'visa', 'work permit'],
        preferredWorkSetup: ['work setup', 'work arrangement', 'remote', 'hybrid', 'office']
    };
    
    // Try to match patterns
    for (let [key, keywords] of Object.entries(patterns)) {
        for (let keyword of keywords) {
            if (combined.includes(keyword)) {
                // Return the matched data if it exists
                if (data[key]) {
                    return data[key];
                }
                // Try alternative keys (e.g., name for fullName)
                if (key === 'fullName' && data.name) return data.name;
                if (key === 'motivation' && data.coverLetter) return data.coverLetter;
                if (key === 'portfolio' && data.website) return data.website;
            }
        }
    }
    
    return null;
}

// Main async function to fill the form
async function fillForm() {
    console.log('🔍 Analyzing form structure...');
    
    // Analyze the form to detect all fields
    const formFields = analyzeForm();
    console.log(`📋 Detected ${formFields.length} form fields`);
    
    // Get resume data - try multiple sources
    let resumeText = resumeData;
    
    if (!resumeText) {
        // Try to fetch from a URL if available
        try {
            const response = await fetch('/resume.txt');
            if (response.ok) {
                resumeText = await response.text();
            }
        } catch (e) {
            console.log('Could not fetch resume.txt, using embedded data');
        }
    }
    
    // If still no resume data, throw error
    if (!resumeText) {
        throw new Error('No resume data available. Please set window.RESUME_DATA or window.AUTO_FILL_CONFIG.resumeData');
    }
    
    console.log('📝 Extracting data from resume using AI...');
    
    // Get form data from API with detected fields
    extractedData = await getFormDataFromResume(
        resumeText, 
        formFields,
        AUTO_FILL_CONFIG.companyName,
        AUTO_FILL_CONFIG.jobTitle
    );
    
    console.log('✅ Extracted data:', extractedData);
    
    const filled = [];
    
    // Fill all detected form fields
    console.log('📝 Filling form fields...');
    
    for (let fieldInfo of formFields) {
        try {
            const value = matchFieldToData(fieldInfo, extractedData);
            
            if (!value) {
                console.log(`⚠️ No data found for field: ${fieldInfo.label || fieldInfo.placeholder}`);
                continue;
            }
            
            const element = fieldInfo.element;
            
            // Handle different field types
            if (element.tagName === 'SELECT') {
                // Handle select dropdowns
                const matchingOption = Array.from(element.options).find(option => {
                    const optionText = option.text.toLowerCase();
                    const optionValue = option.value.toLowerCase();
                    const searchValue = value.toString().toLowerCase();
                    return optionText.includes(searchValue) || 
                           searchValue.includes(optionText) ||
                           optionValue.includes(searchValue);
                });
                
                if (matchingOption) {
                    element.value = matchingOption.value;
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    filled.push(`${fieldInfo.label}: ${matchingOption.text}`);
                    console.log(`✅ Filled select: ${fieldInfo.label} = ${matchingOption.text}`);
                }
            } else if (element.getAttribute('role') === 'combobox' || element.hasAttribute('aria-expanded')) {
                // Handle custom combobox dropdowns
                setTimeout(() => {
                    element.click(); // Open the dropdown
                    setTimeout(() => {
                        const options = document.querySelectorAll('[role="option"], [data-testid*="option"]');
                        for (let option of options) {
                            const optionText = option.textContent?.toLowerCase() || '';
                            const searchValue = value.toString().toLowerCase();
                            if (optionText.includes(searchValue) || searchValue.includes(optionText)) {
                                option.click();
                                filled.push(`${fieldInfo.label}: ${option.textContent}`);
                                console.log(`✅ Filled combobox: ${fieldInfo.label} = ${option.textContent}`);
                                break;
                            }
                        }
                    }, 200);
                }, 100);
            } else if (element.getAttribute('contenteditable')) {
                // Handle contenteditable fields
                element.textContent = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                filled.push(`${fieldInfo.label}: ${value.substring(0, 50)}...`);
                console.log(`✅ Filled contenteditable: ${fieldInfo.label}`);
            } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                // Handle regular input and textarea fields
                element.focus();
                
                // Try modern approach first
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Fallback to execCommand for stubborn fields
                if (element.value !== value) {
                    document.execCommand('selectAll');
                    document.execCommand('delete');
                    document.execCommand('insertText', false, value);
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                filled.push(`${fieldInfo.label || fieldInfo.placeholder}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
                console.log(`✅ Filled input: ${fieldInfo.label || fieldInfo.placeholder} = ${value.substring(0, 30)}...`);
            }
        } catch (error) {
            console.error(`❌ Error filling field ${fieldInfo.label}:`, error);
        }
    }
    
    console.log(`✅ Successfully filled ${filled.length} fields`);
    
    // Return the filled fields array
    return filled;
}

// Execute the form filling and return the promise result
// This allows CDP to wait for the async operation to complete
fillForm().then(filled => {
    console.log('✅ Form filling completed! Filled fields:', filled);
    return filled;
}).catch(error => {
    console.error('❌ Error filling form:', error);
    throw error;
});
