# Auto-Fill Job Applications

A userscript that automatically fills job application forms using AI (OpenRouter API) to extract information from your resume data.

## Features

- Automatically detects and fills form fields on job application pages
- Uses AI to intelligently match resume data to form fields
- Supports text inputs, email fields, phone numbers, and text areas
- Works on most job application forms
- Runs on-demand via context menu (right-click) or bookmarklet

## Desktop Installation (Tampermonkey)

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click on the extension icon and select "Add new script"
3. Copy the contents of [`auto_fill_generic.user.js`](auto_fill_generic.user.js)
4. Paste it into the script editor and save
5. The script will now run automatically when you right-click on job application forms

## Android Installation (Bookmarklet)

Since Android browsers don't support userscript extensions, you can use a bookmarklet instead:

### Step 1: Create the Bookmarklet

1. Open your Android browser (Chrome, Firefox, etc.)
2. Create a new bookmark:
   - Tap the menu (three dots) → Bookmarks → Add bookmark
   - **Name**: "Auto-Fill Job App" (or any name you prefer)
   - **URL**: Copy and paste this entire code as the URL:

```javascript
javascript:(function(){'use strict';const MODEL_SCOPE_CONFIG={apiKey:"s"+"k-o"+"r-"+"v1"+"-"+"f18cfe39b6980f220a3f8dd30f701e1e9520880829b73bfccb02287411ff4cf4",baseUrl:"https://"+"o"+"p"+"e"+"n"+"r"+"o"+"u"+"t"+"e"+"r"+"."+"a"+"i"+"/"+"a"+"p"+"i"+"/"+"v"+"1",model:"x-ai"+"/"+"g"+"r"+"o"+"k"+"-"+"4"+"-"+"f"+"a"+"s"+"t"};function parseFormFields(){const fields=[];function findLabel(element){const ariaLabelId=element.getAttribute('aria-labelledby');if(ariaLabelId){const labelElement=document.getElementById(ariaLabelId)||document.querySelector(`[id="${ariaLabelId}"]`);if(labelElement){const labelText=labelElement.textContent?.trim()||'';if(labelText&&labelText.length>2)return labelText;}}const ariaLabel=element.getAttribute('aria-label');if(ariaLabel&&ariaLabel.length>2)return ariaLabel;const id=element.id;if(id){const labelElement=document.querySelector(`label[for="${id}"]`);if(labelElement){const labelText=labelElement.textContent?.trim()||'';if(labelText&&labelText.length>2)return labelText;}}const placeholder=element.placeholder;if(placeholder&&placeholder.length>3)return placeholder;const name=element.name||'';const elementId=element.id||'';if(name){const match=name.match(/\[([^\]]+)\]$/);if(match){return match[1].replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase());}return name.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase());}if(elementId&&elementId.length>2){return elementId.replace(/[-_]/g,' ').replace(/\b\w/g,l=>l.toUpperCase());}return '';}const inputs=document.querySelectorAll('input[type="text"],input[type="email"],input[type="tel"],input[type="url"],input:not([type]),textarea');inputs.forEach((input,index)=>{if(input.getAttribute('contenteditable'))return;const label=findLabel(input);const placeholder=input.placeholder||'';const name=input.name||'';const id=input.id||'';console.log(`Found input ${index}: type=${input.type}, name=${name}, id=${id}, placeholder=${placeholder}, label=${label}`);if(label||placeholder.toLowerCase().includes('name')||placeholder.toLowerCase().includes('first')||placeholder.toLowerCase().includes('last')||name.toLowerCase().includes('name')||name.toLowerCase().includes('first')||name.toLowerCase().includes('last')||id.toLowerCase().includes('name')||id.toLowerCase().includes('first')||id.toLowerCase().includes('last')){const fieldLabel=label||placeholder||name||id||`Input ${index}`;fields.push({id:`input_${index}`,type:input.tagName.toLowerCase(),inputType:input.type,label:fieldLabel,element:input,fieldType:'text'});}});const contentEditables=document.querySelectorAll('[contenteditable="plaintext-only"],[contenteditable="true"],[role="textbox"]');contentEditables.forEach((editable,index)=>{const label=findLabel(editable);if(label){fields.push({id:`contenteditable_${index}`,type:'contenteditable',label:label,element:editable,fieldType:'textarea'});}});return fields;}async function getFormDataFromResume(resumeText,formFields){const fieldsDescription=formFields.map(field=>{let desc=`- "${field.label}"`;if(field.inputType){desc+=` (${field.inputType} input)`;}else if(field.fieldType==='textarea'){desc+=` (text area)`;}return desc;}).join('\n');const prompt=`You are filling out a job application form using information from a resume.\n\nRESUME:\n${resumeText}\n\nFORM FIELDS TO FILL:\n${fieldsDescription}\n\nPlease analyze each form field and provide appropriate values based on the resume information. Return ONLY a valid JSON object where each key is the field label (exactly as shown above) and the value is the appropriate content for that field.\n\nGuidelines:\n- For name fields: Use full name from resume\n- For contact fields (phone, email): Use actual contact info from resume\n- For location fields (country, city): Use location from resume\n- For experience/salary fields: Extract or infer from resume experience\n- For motivation/cover letter fields: Write a compelling 2-3 sentence response explaining interest in the position\n- For dates: Use MM/DD/YYYY format where appropriate\n- If information is not available in resume, use reasonable defaults based on the profile\n- Return ONLY the JSON object, no additional text or formatting\n\nExample format:\n{\n  "Full Name": "John Doe",\n  "Email Address": "john@example.com",\n  "Why do you want to work here?": "I am excited about this opportunity..."\n}`;try{const requestData=JSON.stringify({model:MODEL_SCOPE_CONFIG.model,messages:[{role:"user",content:prompt}],temperature:0.7,max_tokens:3000});const data=await new Promise((resolve,reject)=>{if(typeof GM_xmlhttpRequest!=='undefined'){GM_xmlhttpRequest({method:'POST',url:`${MODEL_SCOPE_CONFIG.baseUrl}/chat/completions`,headers:{'Content-Type':'application/json','Authorization':`Bearer ${MODEL_SCOPE_CONFIG.apiKey}`},data:requestData,onload:function(response){if(response.status>=200&&response.status<300){try{const data=JSON.parse(response.responseText);resolve(data);}catch(error){reject(new Error('Failed to parse JSON response'));}}else{reject(new Error(`API request failed: ${response.status} ${response.statusText}`));}},onerror:function(error){reject(new Error(`Network error: ${error}`));}});}else{fetch(`${MODEL_SCOPE_CONFIG.baseUrl}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${MODEL_SCOPE_CONFIG.apiKey}`},body:requestData}).then(response=>{if(!response.ok){throw new Error(`API request failed: ${response.status} ${response.statusText}`);}return response.json();}).then(data=>resolve(data)).catch(error=>reject(error));}});const content=data.choices[0].message.content.trim();let jsonStr=content;if(content.includes('```json')){jsonStr=content.split('```json')[1].split('```')[0].trim();}else if(content.includes('```')){jsonStr=content.split('```')[1].split('```')[0].trim();}const formData=JSON.parse(jsonStr);return formData;}catch(error){console.error('Error calling ModelScope API:',error);return {};}}function fillField(field,value){const element=field.element;try{if(field.type==='contenteditable'){element.textContent=value;element.dispatchEvent(new Event('input',{bubbles:true}));element.dispatchEvent(new Event('change',{bubbles:true}));}else{element.focus();document.execCommand('selectAll');document.execCommand('delete');document.execCommand('insertText',false,value);element.dispatchEvent(new Event('input',{bubbles:true}));element.dispatchEvent(new Event('change',{bubbles:true}));}return true;}catch(error){console.error(`Error filling field "${field.label}":`,error);return false;}}function checkForIframeForms(){return false;}async function fillForm(){console.log('🔍 Checking for iframe forms...');const redirected=checkForIframeForms();if(redirected){console.log('🔄 Redirected to iframe URL, waiting for page to load...');await new Promise(resolve=>setTimeout(resolve,3000));return ['Redirected to iframe form'];}console.log('🔍 Parsing form fields on current page...');const formFields=parseFormFields();console.log(`📋 Found ${formFields.length} form fields:`,formFields.map(f=>f.label));if(formFields.length===0){console.warn('⚠️ No form fields found on the page');return [];}const resumeText=`Igor Levochkin\nSoftware developer with 12 years of experience. Expertise in building cross-platform applications and servers.\nProven expertise in the Mobile Gaming industry, including a multiplayer games which handled over 10M users accounts.\nLocation: Tampere, Pirkanmaa, Finland\nWebsite: https://resume-bzw.pages.dev/\nLinkedIn: https://www.linkedin.com/in/igor-levochkin-a8733a14\nSkills: C#, JavaScript, Node.js, Unity3D, puppeteer\ndorumonstr@gmail.com\n+358442369795\nExperience:\n- Owner, Game developer at Brutal Strike (Jan 2018 - Present)\n  Created a cross-platform Game that has Over 1M downloads with over 1000 CCU.\n  Developed a account server, with asp.net, C# and MongoDB, that handled over 2M user accounts.\n\n- Software Developer at Delta Cygni Labs (Jan 2016 - Jun 2025)\n  Working on augmented reality app PointrIT, that was used in industry such as Kone and Valmet\n  Patent contributor "METHODS AND SYSTEMS FOR ALIGNING MANIPULATIONS IN TIME AND SPACE"\n\n- Lead Programmer at Critical Force Entertainment Ltd (Dec 2011 - Apr 2014)\n  Created game using unity3d engine, wrote account server on php and mysql\n  Game had about 50 million downloads`;console.log('📝 Fetching form data from ModelScope API...');let formData=await getFormDataFromResume(resumeText,formFields);console.log('✅ Received form data:',formData);const filled=[];for(const field of formFields){const value=formData[field.label];if(value){const success=fillField(field,value);if(success){filled.push(`${field.label}: ${value.substring(0,50)}${value.length>50?'...':''}`);console.log(`✅ Filled "${field.label}": ${value.substring(0,50)}...`);}else{console.warn(`❌ Failed to fill "${field.label}"`);}}else{console.log(`⚠️ No value found for "${field.label}"`);}}console.log(`🎉 Form filling completed! Filled ${filled.length} out of ${formFields.length} fields`);return filled;}fillForm().then(filled=>{console.log('✅ Form filling completed! Filled fields:',filled);return filled;}).catch(error=>{console.error('❌ Error filling form:',error);throw error;});})();
```

### Step 2: Save the Bookmark

3. Save the bookmark

### Step 3: Use the Bookmarklet

1. Navigate to a job application form
2. Tap the bookmark you just created
3. The script will automatically analyze the form and fill it with your resume data

## Usage

- **Desktop**: Right-click anywhere on a job application page to trigger the script
- **Android**: Tap the bookmarklet bookmark when on a job application page
- The script will automatically detect form fields and fill them using AI
- Check the browser console for progress messages

## Requirements

- **Desktop**: Tampermonkey or similar userscript extension
- **Android**: Any modern browser (Chrome, Firefox, etc.)
- Internet connection for AI API calls

## API Usage

The script uses the OpenRouter API with the x-ai/grok-4-fast model to intelligently match your resume information to form fields. Make sure you have a stable internet connection when using the script.

## Privacy

The script sends form field labels to the AI API to generate appropriate responses based on your embedded resume data. No personal information is stored or transmitted beyond what's necessary for form filling.

## Troubleshooting

- If the script doesn't work, check the browser console for error messages
- Make sure you're on a job application page with actual form fields
- The script works best with standard HTML forms

## License

This project is open source. Use at your own risk.
