// Auto-fill script for WasteHero Job Application form
// Uses document.execCommand() to fill form fields

const mockData = {
    name: "John Doe",
    phone: "+1 555-123-4567",
    email: "john.doe@email.com",
    linkedin: "https://www.linkedin.com/in/john-doe-123456",
    country: "United States",
    city: "San Francisco",
    salary: "$8,000 USD",
    startDate: "01/15/2025",
    motivation: "I am passionate about sustainable waste management and environmental technology. WasteHero's mission to help cities optimize operations and create greener communities resonates deeply with me. I have experience in software development and would love to contribute to building technology that makes a real difference in environmental sustainability. The opportunity to work on solutions that directly impact communities and the planet is what motivates me most."
};

const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], textarea');
const selects = document.querySelectorAll('select');
const comboboxes = document.querySelectorAll('[role="combobox"], [data-testid*="combobox"]');
const filled = [];

// Handle dropdown selections first (both select elements and comboboxes)
const allDropdowns = [...selects, ...comboboxes];

allDropdowns.forEach((dropdown) => {
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

    // Select preferred work setup as "Remote work"
    if (labelText.includes('prefered work setup') || labelText.includes('work setup') || labelText.includes('work arrangement')) {
        // For comboboxes, we need to find the associated options or trigger a click
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
                        }
                    }
                }, 100);
            }, 500);
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
            }
        }
    }
});

// Handle text inputs and textareas
inputs.forEach((input) => {
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
    } else if (labelText.includes('why do you want') || labelText.includes('work with us')) {
        value = mockData.motivation;
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
filled;
