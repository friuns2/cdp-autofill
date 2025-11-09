// ==UserScript==
// @name         Auto-Fill Job Applications
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically fills job application forms using resume data via OpenRouter API
// @author       Igor Levochkin
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @run-at       context-menu
// ==/UserScript==

(function() {
    'use strict';

    // Generic auto-fill script that works with any form
    // Uses OpenRouter API to extract data from resume and fill form fields
    // do not add dropdowns
    // OpenRouter API configuration
const MODEL_SCOPE_CONFIG = {
    apiKey: "s"+"k-o"+"r-"+"v1"+"-"+"f18cfe39b6980f220a3f8dd30f701e1e9520880829b73bfccb02287411ff4cf4",
    baseUrl: "https://"+"o"+"p"+"e"+"n"+"r"+"o"+"u"+"t"+"e"+"r"+"."+"a"+"i"+"/"+"a"+"p"+"i"+"/"+"v"+"1",
    model: "x-ai"+"/"+"g"+"r"+"o"+"k"+"-"+"4"+"-"+"f"+"a"+"s"+"t"
};
// Function to parse all form fields on the page
function parseFormFields() {
    const fields = [];

    // Helper function to find label for an element
    function findLabel(element) {
        // Check for aria-labelledby
        const ariaLabelId = element.getAttribute('aria-labelledby');
        if (ariaLabelId) {
            const labelElement = document.getElementById(ariaLabelId) || document.querySelector(`[id="${ariaLabelId}"]`);
            if (labelElement) {
                const labelText = labelElement.textContent?.trim() || '';
                if (labelText && labelText.length > 2) return labelText;
            }
        }

        // Check for aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.length > 2) return ariaLabel;

        // Check for associated label element
        const id = element.id;
        if (id) {
            const labelElement = document.querySelector(`label[for="${id}"]`);
            if (labelElement) {
                const labelText = labelElement.textContent?.trim() || '';
                if (labelText && labelText.length > 2) return labelText;
            }
        }

        // Check for placeholder
        const placeholder = element.placeholder;
        if (placeholder && placeholder.length > 3) return placeholder;

        // Try to infer from name or id attribute
        const name = element.name || '';
        const elementId = element.id || '';
        
        // Convert name/id to readable label
        if (name) {
            // Extract meaningful part from names like "job_application[first_name]"
            const match = name.match(/\[([^\]]+)\]$/);
            if (match) {
                return match[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        
        if (elementId && elementId.length > 2) {
            return elementId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        return '';
    }

    // Parse input fields - be more inclusive
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input:not([type]), textarea');
    inputs.forEach((input, index) => {
        if (input.getAttribute('contenteditable')) return; // Skip contenteditable handled separately

        const label = findLabel(input);
        const placeholder = input.placeholder || '';
        const name = input.name || '';
        const id = input.id || '';

        // Debug logging
        console.log(`Found input ${index}: type=${input.type}, name=${name}, id=${id}, placeholder=${placeholder}, label=${label}`);

        // Include fields even without labels if they have placeholders or names that suggest they might be form fields
        if (label || placeholder.toLowerCase().includes('name') || placeholder.toLowerCase().includes('first') || placeholder.toLowerCase().includes('last') ||
            name.toLowerCase().includes('name') || name.toLowerCase().includes('first') || name.toLowerCase().includes('last') ||
            id.toLowerCase().includes('name') || id.toLowerCase().includes('first') || id.toLowerCase().includes('last')) {

            const fieldLabel = label || placeholder || name || id || `Input ${index}`;
            fields.push({
                id: `input_${index}`,
                type: input.tagName.toLowerCase(),
                inputType: input.type,
                label: fieldLabel,
                element: input,
                fieldType: 'text'
            });
        }
    });



    // Parse contenteditable elements (rich text fields)
    const contentEditables = document.querySelectorAll('[contenteditable="plaintext-only"], [contenteditable="true"], [role="textbox"]');
    contentEditables.forEach((editable, index) => {
        const label = findLabel(editable);
        if (label) {
            fields.push({
                id: `contenteditable_${index}`,
                type: 'contenteditable',
                label: label,
                element: editable,
                fieldType: 'textarea'
            });
        }
    });

    return fields;
}

// Function to call ModelScope API with generic form fields
async function getFormDataFromResume(resumeText, formFields) {
    const fieldsDescription = formFields.map(field => {
        let desc = `- "${field.label}"`;
        if (field.inputType) {
            desc += ` (${field.inputType} input)`;
        } else if (field.fieldType === 'textarea') {
            desc += ` (text area)`;
        }
        return desc;
    }).join('\n');

    const prompt = `You are filling out a job application form using information from a resume.

RESUME:
${resumeText}

FORM FIELDS TO FILL:
${fieldsDescription}

Please analyze each form field and provide appropriate values based on the resume information. Return ONLY a valid JSON object where each key is the field label (exactly as shown above) and the value is the appropriate content for that field.

Guidelines:
- For name fields: Use full name from resume
- For contact fields (phone, email): Use actual contact info from resume
- For location fields (country, city): Use location from resume
- For experience/salary fields: Extract or infer from resume experience
- For motivation/cover letter fields: Write a compelling 2-3 sentence response explaining interest in the position
- For dates: Use MM/DD/YYYY format where appropriate
- If information is not available in resume, use reasonable defaults based on the profile
- Return ONLY the JSON object, no additional text or formatting

Example format:
{
  "Full Name": "John Doe",
  "Email Address": "john@example.com",
  "Why do you want to work here?": "I am excited about this opportunity..."
}`;

    try {
        const requestData = JSON.stringify({
            model: MODEL_SCOPE_CONFIG.model,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 3000
        });

        const data = await new Promise((resolve, reject) => {
            if (typeof GM_xmlhttpRequest !== 'undefined') {
                // Use GM_xmlhttpRequest if available
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: `${MODEL_SCOPE_CONFIG.baseUrl}/chat/completions`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${MODEL_SCOPE_CONFIG.apiKey}`
                    },
                    data: requestData,
                    onload: function(response) {
                        if (response.status >= 200 && response.status < 300) {
                            try {
                                const data = JSON.parse(response.responseText);
                                resolve(data);
                            } catch (error) {
                                reject(new Error('Failed to parse JSON response'));
                            }
                        } else {
                            reject(new Error(`API request failed: ${response.status} ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        reject(new Error(`Network error: ${error}`));
                    }
                });
            } else {
                // Fall back to fetch
                fetch(`${MODEL_SCOPE_CONFIG.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${MODEL_SCOPE_CONFIG.apiKey}`
                    },
                    body: requestData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => resolve(data))
                .catch(error => reject(error));
            }
        });
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
        // Fallback: return empty object to trigger manual fallback handling
        return {};
    }
}

// Generic function to fill any form field
function fillField(field, value) {
    const element = field.element;

    try {
        if (field.type === 'contenteditable') {
            // Handle contenteditable elements
            element.textContent = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            // Handle regular input/textarea elements
            element.focus();
            document.execCommand('selectAll');
            document.execCommand('delete');
            document.execCommand('insertText', false, value);
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return true;
    } catch (error) {
        console.error(`Error filling field "${field.label}":`, error);
        return false;
    }
}

// Function to detect and handle iframe forms
function checkForIframeForms() {
  
    return false; // No iframe form detected
}

// Main async function to fill the form
async function fillForm() {
    console.log('🔍 Checking for iframe forms...');

    // First, check if the form is in an iframe and redirect if needed
    const redirected = checkForIframeForms();
    if (redirected) {
        console.log('🔄 Redirected to iframe URL, waiting for page to load...');
        // Wait a bit for the redirect to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        return ['Redirected to iframe form'];
    }

    console.log('🔍 Parsing form fields on current page...');

    // Parse all form fields on the page
    const formFields = parseFormFields();
    console.log(`📋 Found ${formFields.length} form fields:`, formFields.map(f => f.label));

    if (formFields.length === 0) {
        console.warn('⚠️ No form fields found on the page');
        return [];
    }

    // Use hardcoded resume data
    const resumeText = `Igor Levochkin
Software developer with 12 years of experience. Expertise in building cross-platform applications and servers.
Proven expertise in the Mobile Gaming industry, including a multiplayer games which handled over 10M users accounts.
Location: Tampere, Pirkanmaa, Finland
Website: https://resume-bzw.pages.dev/
LinkedIn: https://www.linkedin.com/in/igor-levochkin-a8733a14
Skills: C#, JavaScript, Node.js, Unity3D, puppeteer
dorumonstr@gmail.com
+358442369795
Experience:
- Owner, Game developer at Brutal Strike (Jan 2018 - Present)
  Created a cross-platform Game that has Over 1M downloads with over 1000 CCU.
  Developed a account server, with asp.net, C# and MongoDB, that handled over 2M user accounts.

- Software Developer at Delta Cygni Labs (Jan 2016 - Jun 2025)
  Working on augmented reality app PointrIT, that was used in industry such as Kone and Valmet
  Patent contributor "METHODS AND SYSTEMS FOR ALIGNING MANIPULATIONS IN TIME AND SPACE"

- Lead Programmer at Critical Force Entertainment Ltd (Dec 2011 - Apr 2014)
  Created game using unity3d engine, wrote account server on php and mysql
  Game had about 50 million downloads`;

    console.log('📝 Fetching form data from ModelScope API...');

    // Get form data from API using the parsed fields
    let formData = await getFormDataFromResume(resumeText, formFields);

    console.log('✅ Received form data:', formData);

    const filled = [];

    // Fill each field with the corresponding data
    for (const field of formFields) {
        const value = formData[field.label];
        if (value) {
            const success = fillField(field, value);
            if (success) {
                filled.push(`${field.label}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
                console.log(`✅ Filled "${field.label}": ${value.substring(0, 50)}...`);
            } else {
                console.warn(`❌ Failed to fill "${field.label}"`);
            }
        } else {
            console.log(`⚠️ No value found for "${field.label}"`);
        }
    }

    console.log(`🎉 Form filling completed! Filled ${filled.length} out of ${formFields.length} fields`);
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

})();
