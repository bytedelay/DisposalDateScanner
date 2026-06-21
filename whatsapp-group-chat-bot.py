import requests
import json

# 1. Your API Gateway configurations
# (You get these when you link your WhatsApp number to the gateway via a QR code)
API_URL = "https://gate.whapi.cloud/messages/text"
API_TOKEN = "2mrggnpHtAX8l3bKYv7SqvO0Hy2aJ2e5"

# 2. Define the payload
# Unofficial APIs allow you to send directly to any WhatsApp Group ID
payload = {
    "to": "120363406460624256@g.us", # WhatsApp Group IDs end in @g.us
    "body": "If this goes through, we have successfully sent a message to the WhatsApp group via the unofficial API!"
}

headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": f"Bearer {API_TOKEN}"
}

# 3. Send the message instantly, headless, no browser required.
response = requests.post(API_URL, json=payload, headers=headers)

if response.status_code == 200:
    print("Message successfully injected into the WhatsApp network by the bot!")
else:
    print(f"Failed to send: {response.text}")