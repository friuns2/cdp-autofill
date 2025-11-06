#!/usr/bin/env python3
"""
Auto-fill form using Chrome DevTools Protocol (CDP)
Connects to existing Chrome browser and executes form filling script
"""

import asyncio
import json
import websockets
import sys
from typing import Optional, Dict, Any

class CDPAutoFill:
    def __init__(self, websocket_url: str):
        self.websocket_url = websocket_url
        self.websocket: Optional[websockets.WebSocketServerProtocol] = None
        self.command_id = 1
        self.pending_commands: Dict[int, asyncio.Future] = {}

    async def connect(self):
        """Connect to the CDP WebSocket"""
        try:
            self.websocket = await websockets.connect(self.websocket_url)
            print(f"✅ Connected to CDP at {self.websocket_url}")

            # Start listening for responses
            asyncio.create_task(self._listen())

            # Enable necessary domains
            await self._send_command("Page.enable")
            await self._send_command("Runtime.enable")
            await self._send_command("DOM.enable")

        except Exception as e:
            print(f"❌ Failed to connect to CDP: {e}")
            sys.exit(1)

    async def _listen(self):
        """Listen for CDP responses"""
        try:
            async for message in self.websocket:
                response = json.loads(message)

                # Handle command responses
                if 'id' in response and response['id'] in self.pending_commands:
                    future = self.pending_commands.pop(response['id'])
                    if 'error' in response:
                        future.set_exception(Exception(response['error']['message']))
                    else:
                        future.set_result(response.get('result', {}))

                # Handle events (optional logging)
                elif 'method' in response:
                    # Uncomment to see all events
                    # print(f"Event: {response['method']}")
                    pass

        except websockets.exceptions.ConnectionClosed:
            print("🔌 CDP connection closed")

    async def _send_command(self, method: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Send a CDP command and wait for response"""
        if not self.websocket:
            raise Exception("Not connected to CDP")

        command = {
            "id": self.command_id,
            "method": method,
            "params": params or {}
        }

        future = asyncio.Future()
        self.pending_commands[self.command_id] = future

        await self.websocket.send(json.dumps(command))
        self.command_id += 1

        return await future

    async def navigate_to_form(self, url: str):
        """Navigate to the form page"""
        print(f"🌐 Navigating to {url}")
        await self._send_command("Page.navigate", {"url": url})

        # Wait for page to load
        await asyncio.sleep(2)

    async def execute_auto_fill_script(self):
        """Execute the auto-fill JavaScript"""
        script = """
        // Mock data for execCommand auto-fill
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

        // Function to fill field using execCommand
        function fillFieldWithExecCommand(element, text) {
            element.focus();

            // Use execCommand as requested
            document.execCommand('selectAll');
            document.execCommand('delete');
            document.execCommand('insertText', false, text);

            // Dispatch events to ensure form recognizes the change
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));

            return true;
        }

        // Get all input elements and textareas
        const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], textarea');
        const filledFields = [];

        inputs.forEach((input) => {
            // Check various ways to identify the field
            const placeholder = input.placeholder || '';

            // Find the associated label
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
            } else if (labelText.includes('phone') || placeholder.includes('country code')) {
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
            } else if (placeholder.includes('mm/dd/yyyy') || labelText.includes('start date')) {
                value = mockData.startDate;
            } else if (labelText.includes('why do you want') || labelText.includes('work with us')) {
                value = mockData.motivation;
            }

            if (value) {
                fillFieldWithExecCommand(input, value);
                filledFields.push(labelText + ': ' + value.substring(0, 30) + '...');
            }
        });

        return filledFields;
        """

        print("📝 Executing auto-fill script...")

        try:
            result = await self._send_command("Runtime.evaluate", {
                "expression": script,
                "returnByValue": True
            })

            if 'result' in result and 'value' in result['result']:
                filled_fields = result['result']['value']
                print("✅ Auto-fill completed!")
                for field in filled_fields:
                    print(f"   • {field}")
                return filled_fields
            else:
                print("❌ Script execution failed")
                return []

        except Exception as e:
            print(f"❌ Error executing script: {e}")
            return []

    async def close(self):
        """Close the CDP connection"""
        if self.websocket:
            await self.websocket.close()
            print("🔌 CDP connection closed")

async def main():
    # Chrome CDP WebSocket URL - you need to get this from your running Chrome instance
    # You can find this by going to chrome://inspect/#devices and copying the WebSocket URL
    # Or by starting Chrome with: chrome --remote-debugging-port=9222

    CDP_URL = "ws://localhost:9222/devtools/browser"  # Default for local Chrome
    FORM_URL = "https://airtable.com/appnFx0g1bd3i8Shb/pagTDfAhnTL0JktPf/form"  # The form URL

    # Allow user to specify custom CDP URL
    if len(sys.argv) > 1:
        CDP_URL = sys.argv[1]

    if len(sys.argv) > 2:
        FORM_URL = sys.argv[2]

    print("🚀 Starting CDP Auto-Fill Script")
    print(f"🔗 CDP URL: {CDP_URL}")
    print(f"📄 Form URL: {FORM_URL}")

    cdp = CDPAutoFill(CDP_URL)

    try:
        # Connect to CDP
        await cdp.connect()

        # Navigate to form (optional - comment out if already on the page)
        await cdp.navigate_to_form(FORM_URL)

        # Execute auto-fill
        filled_fields = await cdp.execute_auto_fill_script()

        # Keep connection alive briefly to see results
        await asyncio.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await cdp.close()

if __name__ == "__main__":
    print("💡 Usage: python auto_fill_cdp.py [cdp_url] [form_url]")
    print("💡 Default CDP URL: ws://localhost:9222/devtools/browser")
    print("💡 Find your CDP URL at: chrome://inspect/#devices")
    print()

    asyncio.run(main())
