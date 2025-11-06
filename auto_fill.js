// Auto-fill script for WasteHero Job Application form
// Uses ModelScope API to extract data from resume and fill form fields

// ModelScope API configuration
const MODEL_SCOPE_CONFIG = {
    apiKey: "ms-af1bbcd8-400f-4b00-907d-96924da90955",
    baseUrl: "https://api-inference.modelscope.cn/v1",
    model: "Qwen/Qwen3-Coder-480B-A35B-Instruct"
};

// Resume data - can be set externally or fetched
let resumeData = window.RESUME_DATA || null;

// Function to call ModelScope API
async function getFormDataFromResume(resumeText, companyName = "WasteHero", jobTitle = "Data Engineer") {
    const prompt = `You are extracting information from a resume/LinkedIn profile to fill out a job application form.

RESUME/LINKEDIN PROFILE:
${resumeText}

COMPANY: ${companyName}
JOB TITLE: ${jobTitle}

Please extract the following information and return ONLY a valid JSON object with these exact keys:
{
  "name": "Full name",
  "phone": "Phone number with country code",
  "email": "Email address",
  "linkedin": "LinkedIn profile URL",
  "country": "Country name",
  "city": "City name",
  "salary": "Expected salary (e.g., $8,000 USD)",
  "startDate": "Available start date in MM/DD/YYYY format",
  "motivation": "A compelling 2-3 sentence motivation letter explaining why you want to work with ${companyName} as a ${jobTitle}, highlighting relevant experience from the resume"
}

Important:
- Extract real information from the resume when available
- For missing information, use reasonable defaults based on the profile
- The motivation should be personalized and reference specific experience from the resume
- Return ONLY the JSON object, no additional text or markdown formatting`;

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
        // Fallback to default data
        return {
            name: "Igor Levochkin",
            phone: "+358 50 123 4567",
            email: "igor@igor.ink",
            linkedin: "https://www.linkedin.com/in/igor-levochkin-a8733a14",
            country: "Finland",
            city: "Tampere",
            salary: "$8,000 USD",
            startDate: "02/01/2025",
            motivation: "I am passionate about sustainable waste management and environmental technology. WasteHero's mission to help cities optimize operations and create greener communities resonates deeply with me. I have experience in software development and would love to contribute to building technology that makes a real difference in environmental sustainability."
        };
    }
}

// Initialize form data (will be populated after API call)
let mockData = null;

// Main async function to fill the form
async function fillForm() {
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
    
    // If still no resume data, use a default (extracted from resume.txt)
    if (!resumeText) {
        resumeText = `Igor Levochkin
Software developer with 12 years of experience. Expertise in building cross-platform applications and servers. 
Proven expertise in the Mobile Gaming industry, including a multiplayer games which handled over 10M users accounts.
Location: Tampere, Pirkanmaa, Finland
Website: https://igor.ink
LinkedIn: https://www.linkedin.com/in/igor-levochkin-a8733a14
Skills: C#, JavaScript, Node.js, Unity3D, puppeteer

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
    }
    
    console.log('📝 Fetching form data from ModelScope API...');
    
    // Get form data from API
    mockData = await getFormDataFromResume(resumeText, "WasteHero", "Data Engineer");
    
    console.log('✅ Received form data:', mockData);
    
    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], textarea');
    const selects = document.querySelectorAll('select');
    const comboboxes = document.querySelectorAll('[role="combobox"], [data-testid*="combobox"]');
    const filled = [];

    // Handle dropdown selections sequentially - Work Setup first, then Role
    const allDropdowns = [...selects, ...comboboxes];

    // Function to find label for a dropdown
    function findDropdownLabel(dropdown) {
        let labelText = '';
        let element = dropdown;

        // Walk up the DOM to find labels
        for (let i = 0; i < 10; i++) {
            element = element.parentElement;
            if (!element) break;

            const labels = element.querySelectorAll('p, span, div, label, [data-testid*="label"]');
            for (let label of labels) {
                const text = label.textContent?.trim() || label.getAttribute('aria-label') || '';
                if (text && text.length > 3 && !text.includes('*')) {
                    labelText = text.toLowerCase();
                    break;
                }
            }
            if (labelText) break;
        }
        return labelText;
    }

    // Function to select work setup option
    function selectWorkSetup(dropdown) {
        if (dropdown.getAttribute('role') === 'combobox' || dropdown.hasAttribute('aria-expanded')) {
            // This is a combobox - try to find and click the remote option
            setTimeout(() => {
                dropdown.click(); // Open the dropdown
                setTimeout(() => {
                    // Look for remote option in the dropdown menu
                    const remoteOptions = document.querySelectorAll('[role="option"], [data-testid*="option"]');
                    for (let option of remoteOptions) {
                        const optionText = option.textContent?.toLowerCase() || '';
                        if (optionText.includes('remote')) {
                            option.click();
                            filled.push('Preferred Work Setup: Remote work');
                            // After work setup is done, handle role selection
                            setTimeout(() => selectRole(), 1000);
                            return;
                        }
                    }
                    // Fallback: try to set value directly
                    if (dropdown.tagName === 'SELECT') {
                        const remoteOption = Array.from(dropdown.options).find(option =>
                            option.text.toLowerCase().includes('remote') ||
                            option.value.toLowerCase().includes('remote')
                        );
                        if (remoteOption) {
                            dropdown.value = remoteOption.value;
                            dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                            filled.push('Preferred Work Setup: Remote work');
                            // After work setup is done, handle role selection
                            setTimeout(() => selectRole(), 1000);
                        }
                    }
                }, 200);
            }, 300);
        } else if (dropdown.tagName === 'SELECT') {
            // Regular select element
            const remoteOption = Array.from(dropdown.options).find(option =>
                option.text.toLowerCase().includes('remote') ||
                option.value.toLowerCase().includes('remote')
            );

            if (remoteOption) {
                dropdown.value = remoteOption.value;
                dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                dropdown.dispatchEvent(new Event('input', { bubbles: true }));
                filled.push('Preferred Work Setup: Remote work');
                // After work setup is done, handle role selection
                setTimeout(() => selectRole(), 1000);
            }
        }
    }

    // Function to select role option
    function selectRole() {
        const roleDropdown = allDropdowns.find(dropdown => {
            const labelText = findDropdownLabel(dropdown);
            return labelText.includes('role') && labelText.includes('applying') ||
                   labelText.includes('position') || labelText.includes('job title');
        });

        if (!roleDropdown) return;

        if (roleDropdown.getAttribute('role') === 'combobox' || roleDropdown.hasAttribute('aria-expanded')) {
            // This is a combobox - try to find and click the data engineer option
            setTimeout(() => {
                roleDropdown.click(); // Open the dropdown
                setTimeout(() => {
                    // Look for data engineer option in the dropdown menu
                    const roleOptions = document.querySelectorAll('[role="option"], [data-testid*="option"]');
                    for (let option of roleOptions) {
                        const optionText = option.textContent?.toLowerCase() || '';
                        if (optionText.includes('data engineer') || optionText.includes('data') && optionText.includes('engineer')) {
                            option.click();
                            filled.push('Role you are applying for: Data Engineer');
                            return;
                        }
                    }
                    // Fallback: try to set value directly
                    if (roleDropdown.tagName === 'SELECT') {
                        const dataEngineerOption = Array.from(roleDropdown.options).find(option =>
                            option.text.toLowerCase().includes('data engineer') ||
                            (option.text.toLowerCase().includes('data') && option.text.toLowerCase().includes('engineer'))
                        );
                        if (dataEngineerOption) {
                            roleDropdown.value = dataEngineerOption.value;
                            roleDropdown.dispatchEvent(new Event('change', { bubbles: true }));
                            filled.push('Role you are applying for: Data Engineer');
                        }
                    }
                }, 200);
            }, 300);
        } else if (roleDropdown.tagName === 'SELECT') {
            // Regular select element
            const dataEngineerOption = Array.from(roleDropdown.options).find(option =>
                option.text.toLowerCase().includes('data engineer') ||
                (option.text.toLowerCase().includes('data') && option.text.toLowerCase().includes('engineer'))
            );

            if (dataEngineerOption) {
                roleDropdown.value = dataEngineerOption.value;
                roleDropdown.dispatchEvent(new Event('change', { bubbles: true }));
                roleDropdown.dispatchEvent(new Event('input', { bubbles: true }));
                filled.push('Role you are applying for: Data Engineer');
            }
        }
    }

    // Start with work setup selection
    const workSetupDropdown = allDropdowns.find(dropdown => {
        const labelText = findDropdownLabel(dropdown);
        return labelText.includes('prefered work setup') || labelText.includes('work setup') || labelText.includes('work arrangement');
    });

    if (workSetupDropdown) {
        selectWorkSetup(workSetupDropdown);
    } else {
        // If no work setup dropdown found, go directly to role selection
        setTimeout(() => selectRole(), 500);
    }

    // Handle contenteditable elements (like the motivation field)
    const contentEditables = document.querySelectorAll('[contenteditable="plaintext-only"], [contenteditable="true"], [role="textbox"]');
    contentEditables.forEach((editable) => {
        let labelText = '';
        let element = editable;

        // Walk up the DOM to find labels
        for (let i = 0; i < 10; i++) {
            element = element.parentElement;
            if (!element) break;

            const labels = element.querySelectorAll('p, span, div, label');
            for (let label of labels) {
                const text = label.textContent?.trim() || '';
                if (text && text.length > 3 && !text.includes('*') && !text.includes('Please include')) {
                    labelText = text.toLowerCase();
                    break;
                }
            }
            if (labelText) break;
        }

        // Fill motivation field using aria-labelledby (working method)
        const ariaLabelId = editable.getAttribute('aria-labelledby');
        const isMotivationField = ariaLabelId && (() => {
            const labelElement = document.getElementById(ariaLabelId) || document.querySelector(`[id="${ariaLabelId}"]`);
            return labelElement && labelElement.textContent &&
                   (labelElement.textContent.includes('Why do you want') || labelElement.textContent.includes('work with us'));
        })();

        if (isMotivationField) {
            // For contenteditable elements, set textContent directly
            editable.textContent = mockData.motivation;
            editable.dispatchEvent(new Event('input', { bubbles: true }));
            editable.dispatchEvent(new Event('change', { bubbles: true }));
            filled.push('Why do you want to work with us?: ' + mockData.motivation.substring(0, 30) + '...');
        }
    });

    // Handle text inputs and textareas (excluding contenteditable)
    inputs.forEach((input) => {
        // Skip contenteditable elements as they're handled separately
        if (input.getAttribute('contenteditable')) return;

        let labelText = '';
        let element = input;

        // Walk up the DOM to find labels
        for (let i = 0; i < 10; i++) {
            element = element.parentElement;
            if (!element) break;

            const labels = element.querySelectorAll('p, span, div, label');
            for (let label of labels) {
                const text = label.textContent?.trim() || '';
                if (text && text.length > 3 && !text.includes('*') && !text.includes('Please include')) {
                    labelText = text.toLowerCase();
                    break;
                }
            }
            if (labelText) break;
        }

        // Determine value based on field identification
        let value = '';
        if (labelText.includes('name') && labelText.includes('last name')) {
            value = mockData.name;
        } else if (labelText.includes('phone') || input.placeholder?.includes('country code')) {
            value = mockData.phone;
        } else if (labelText.includes('email')) {
            value = mockData.email;
        } else if (labelText.includes('linkedin')) {
            value = mockData.linkedin;
        } else if (labelText.includes('country')) {
            value = mockData.country;
        } else if (labelText.includes('city')) {
            value = mockData.city;
        } else if (labelText.includes('salary')) {
            value = mockData.salary;
        } else if (input.placeholder?.includes('mm/dd/yyyy') || labelText.includes('start date')) {
            value = mockData.startDate;
        // Skip motivation field - handled separately for contenteditable elements
        }

        // Fill the field using execCommand
        if (value) {
            input.focus();
            document.execCommand('selectAll');
            document.execCommand('delete');
            document.execCommand('insertText', false, value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filled.push(labelText + ': ' + value.substring(0, 30) + '...');
        }
    });

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
