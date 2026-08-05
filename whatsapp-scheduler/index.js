const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { isToday, parseISO } = require('date-fns');

// 1. Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox']
    }
});

// 2. Fallback QR handler
client.on('qr', (qr) => {
    console.log('Session expired. Scan QR again:');
    qrcode.generate(qr, { small: true });
});

// Helper function to build dynamic message based on color/type
function getBinMessage(boxColour, binType) {
    switch (boxColour?.toLowerCase().trim()) {
        case 'cyan':
            return "Remove the recycling compost bin ♻️";
        case 'black':
            return "Remove the wet waste bin 🗑️";
        default:
            return `Reminder: Remove the ${boxColour || ''} (${binType || 'waste'}) bin`;
    }
}

// Function to schedule reminders from CSV
function scheduleBinReminders(client, targetGroupId) {
    const csvFilePath = path.join(__dirname, 'resources', 'csv', 'bin_collection_dates.csv');
    const rows = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', () => {
            console.log(`📋 Total CSV records loaded: ${rows.length}`);

            // Filter rows that match TODAY's collection date
            const todayRows = rows.filter(row => {
                const dateStr = row.collection_date || row.reminder_same_day;
                if (!dateStr) return false;
                
                // Parses YYYY-MM-DD
                const collectionDate = parseISO(dateStr.trim());
                return isToday(collectionDate);
            });

            if (todayRows.length === 0) {
                console.log('ℹ️ No bin collections scheduled for today.');
                return;
            }

            console.log(`📅 Found ${todayRows.length} collection reminder(s) for today.`);

            // Loop through all matching rows for today
            todayRows.forEach((row, index) => {
                const message = getBinMessage(row.box_colour, row.bin_type);

                // Example offset logic: Start at 16:30 for 1st item, 16:45 for 2nd, +15 mins for Nth item
                const baseMinute = 30;
                const offsetMinute = baseMinute + (index * 15);
                
                const hour = 16 + Math.floor(offsetMinute / 60);
                const minute = offsetMinute % 60;

                const cronTime = `${minute} ${hour} * * *`;

                console.log(`⏰ Scheduling "${message}" at ${hour}:${minute < 10 ? '0' : ''}${minute} (Cron: ${cronTime})`);

                cron.schedule(cronTime, async () => {
                    try {
                        console.log(`[${new Date().toISOString()}] Sending scheduled reminder...`);
                        await client.sendMessage(targetGroupId, message);
                        console.log(`✅ Message sent: "${message}"`);
                    } catch (error) {
                        console.error('❌ Failed to send scheduled message:', error);
                    }
                }, {
                    scheduled: true,
                    timezone: "Europe/London"
                });
            });
        });
}

// 3. Core Logic
client.on('ready', () => {
    console.log('Scheduler bot is alive and listening 24/7...');

    const targetGroupId = '120363406460624256@g.us';

    // Run scheduler setup once every day at midnight (00:01) to reload today's reminders
    cron.schedule('1 0 * * *', () => {
        console.log('🔄 Daily midnight refresh: Checking CSV for today\'s tasks...');
        scheduleBinReminders(client, targetGroupId);
    }, {
        scheduled: true,
        timezone: "Europe/London"
    });

    // Run immediately when client starts up
    scheduleBinReminders(client, targetGroupId);
});

client.initialize();
