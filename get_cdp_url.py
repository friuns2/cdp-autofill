#!/usr/bin/env python3
"""
Helper script to get the Chrome DevTools Protocol (CDP) WebSocket URL
from a running Chrome instance
"""

import requests
import json
import sys

def get_cdp_urls(port=9222):
    """Get CDP WebSocket URLs from Chrome debugging port"""
    try:
        # Query Chrome's debugging JSON endpoint
        response = requests.get(f"http://localhost:{port}/json")
        response.raise_for_status()

        tabs = response.json()

        print("🔍 Found Chrome tabs/pages:")
        print("=" * 50)

        for i, tab in enumerate(tabs, 1):
            print(f"{i}. {tab.get('title', 'Unknown')} - {tab.get('url', 'Unknown')}")
            print(f"   WebSocket: {tab['webSocketDebuggerUrl']}")
            print(f"   Type: {tab.get('type', 'unknown')}")
            print()

        # Return the first page/tab (usually the main browser session)
        if tabs:
            return tabs[0]['webSocketDebuggerUrl']

    except requests.exceptions.RequestException as e:
        print(f"❌ Error connecting to Chrome on port {port}: {e}")
        print("💡 Make sure Chrome is running with: chrome --remote-debugging-port=9222")
        return None
    except json.JSONDecodeError:
        print("❌ Invalid JSON response from Chrome")
        return None

def main():
    port = 9222  # Default Chrome debugging port

    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"❌ Invalid port number: {sys.argv[1]}")
            sys.exit(1)

    print("🔗 Chrome DevTools Protocol (CDP) URL Finder")
    print(f"📡 Checking port {port}...")
    print()

    cdp_url = get_cdp_urls(port)

    if cdp_url:
        print("✅ Use this WebSocket URL in your auto-fill script:")
        print(f"   {cdp_url}")
        print()
        print("📋 Copy this command to run the auto-fill:")
        print(f"   python auto_fill_cdp.py \"{cdp_url}\"")
    else:
        print("❌ No Chrome instances found on this port")
        print("💡 Start Chrome with: chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile")

if __name__ == "__main__":
    print("💡 Usage: python get_cdp_url.py [port]")
    print("💡 Default port: 9222")
    print()
    main()
