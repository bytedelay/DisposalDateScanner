const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

// 1. Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false, // Prevents crashes during manual stops
        args: ['--no-sandbox']
    }
});

// 2. Fallback QR handler (in case your session logs out)
client.on('qr', (qr) => {
    console.log('Session expired. Scan QR again:');
    qrcode.generate(qr, { small: true });
});

// 3. The Core Scheduler Logic
client.on('ready', () => {
    console.log('Scheduler bot is alive and listening 24/7...');

    // PASTE YOUR COPIED GROUP ID HERE:
    const targetGroupId = '120363406460624256@g.us'; // Hardcoding for testing, if it works, it will shift to constant.js file
    
    // Define the message payload
    const automatedMessage = "Good evening team! 🌙 This is your scheduled evening update reminder. Have a great night!";

    // CRON SYNTAX: 'Minute Hour Day-of-Month Month Day-of-Week'
    // '43 19 * * *' means: Minute 43, Hour 19 (7 PM), Every Day, Every Month, Every Day of the week
    cron.schedule('43 19 * * *', async () => {
        try {
            console.log(`[${new Date().toISOString()}] Attempting to send scheduled message...`);
            
            // Dispatch message to the group
            await client.sendMessage(targetGroupId, automatedMessage);
            
            console.log('✅ Message successfully sent to the group!');
        } catch (error) {
            console.error('❌ Failed to send scheduled message:', error);
        }
    }, {
        scheduled: true,
        timezone: "Europe/London" // ⚠️ CHANGE THIS to your local timezone (e.g., "America/New_York")
    });
});

client.initialize();