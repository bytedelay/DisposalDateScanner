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



########################################################################################

pip install pywa

from pywa import WhatsApp, filters, types

# Initialize your WhatsApp Engine

wa = WhatsApp(
    phone_id="YOUR_WHATSAPP_PHONE_NUMBER_ID", # From Meta Developer Console
    token="YOUR_PERMANENT_ACCESS_TOKEN",      # Your API Token
    app_id=123456789,                        # Your Meta App ID
    app_secret="your_app_secret_here",
    
    # Connecting your Webhook configuration
    callback_url="https://xxxx-xxxx.ngrok-free.app/webhook", # Paste your ngrok URL here
    verify_token="my_secure_handshake_token",              # Invent any password string you want
)

# Listeners: When a text message comes in, execute this function
@wa.on_message(filters.text)
def handle_incoming_messages(_: WhatsApp, msg: types.Message):
    user_text = msg.text.lower()
    
    if "hello" in user_text or "hi" in user_text:
        msg.reply(f"👋 Hello {msg.from_user.name}! How can I help you today?")
        
    elif "!status" in user_text:
        msg.reply("🤖 Bot Status: Operational and running via Python.")
        
    else:
        msg.reply("I'm a simple bot. Try saying 'Hello' or '!status'.")

# Start your local webhook listener server
if __name__ == "__main__":
    # Runs a lightweight web app on port 5000 waiting for WhatsApp to ping it
    wa.run(port=5000)

#I can configure this if I can create a bot within meta workspace ? the question is how can i create it. So i suppose this will be my TODO list.
# website - https://developers.facebook.com/apps/creation/
