#!/usr/bin/env python3
"""
Test script for the CDP auto-fill functionality
This demonstrates how to use the auto_fill_cdp module
"""

import asyncio
from auto_fill_cdp import CDPAutoFill

async def test_auto_fill():
    """Test the auto-fill functionality"""

    # Example CDP URL - replace with your actual Chrome debugging URL
    CDP_URL = "ws://localhost:9222/devtools/browser"

    # Form URL to test with (using a generic test form)
    FORM_URL = "https://airtable.com/appnFx0g1bd3i8Shb/pagTDfAhnTL0JktPf/form"

    print("🧪 Testing CDP Auto-Fill")
    print(f"🔗 Connecting to: {CDP_URL}")
    print(f"📄 Target form: {FORM_URL}")

    # Initialize CDP connection
    cdp = CDPAutoFill(CDP_URL)

    try:
        # Connect to Chrome
        await cdp.connect()

        # Navigate to the form
        await cdp.navigate_to_form(FORM_URL)

        # Execute auto-fill
        filled_fields = await cdp.execute_auto_fill_script()

        print(f"\n✅ Test completed! Filled {len(filled_fields)} fields")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("\n💡 Make sure Chrome is running with: chrome --remote-debugging-port=9222")

    finally:
        await cdp.close()

if __name__ == "__main__":
    print("🚀 CDP Auto-Fill Test Script")
    print("Make sure Chrome is running with remote debugging enabled!")
    print("Command: chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-test")
    print()

    asyncio.run(test_auto_fill())
