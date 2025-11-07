#!/usr/bin/env python3
"""
Auto-fill form using Chrome DevTools Protocol (CDP)
Connects to existing Chrome browser and executes form filling script
"""

import asyncio
import json
import os
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
            await self._send_command("Console.enable")

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
                    if response['method'] == 'Console.messageAdded':
                        msg = response['params']['message']
                        print(f"🖥️  CONSOLE: {msg.get('text', '')}")
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
        """Execute the auto-fill JavaScript from external file"""
        try:
            # Read the JavaScript file
            with open("auto_fill_generic.js", "r") as f:
                script = f.read()
            print("📜 Loaded generic auto-fill script")
        except FileNotFoundError:
            print("❌ auto_fill_generic.js file not found")
            return []
        except Exception as e:
            print(f"❌ Error reading JavaScript file: {e}")
            return []

        # Try to read resume data
        resume_data = None
        try:
            with open("resume.txt", "r", encoding="utf-8") as f:
                resume_data = f.read()
            print("📄 Loaded resume.txt")
        except FileNotFoundError:
            print("⚠️  resume.txt not found, script will use default resume data")
        except Exception as e:
            print(f"⚠️  Error reading resume.txt: {e}")

        # Inject resume data into the script if available
        if resume_data:
            # Escape the resume data for JavaScript
            resume_json = json.dumps(resume_data)
            script = f"window.RESUME_DATA = {resume_json};\n" + script

        # Wait a bit for dynamic content to load
        print("📝 Waiting for dynamic content to load...")
        await asyncio.sleep(2)

        print("📝 Executing auto-fill script from auto_fill.js...")

        try:
            result = await self._send_command("Runtime.evaluate", {
                "expression": script,
                "returnByValue": True,
                "awaitPromise": True
            })

            if 'result' in result and 'value' in result['result']:
                filled_fields = result['result']['value']
                print("✅ Auto-fill completed!")
                for field in filled_fields:
                    print(f"   • {field}")
                return filled_fields
            else:
                print("❌ Script execution failed")
                print("Result:", result)
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
