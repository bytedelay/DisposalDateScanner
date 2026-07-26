const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Session expired. Scan QR again:');
    qrcode.generate(qr, { small: true });
});

function parseCSVLine(line) {
    return line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
}

function loadRemindersFromCSV() {
    const csvPath = path.join(__dirname, 'bin_collection_dates.csv');
    const raw = fs.readFileSync(csvPath, 'utf8').trim();
    const lines = raw.split(/\r?\n/);

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1);

    const reminders = [];

    for (const line of rows) {
        if (!line.trim()) continue;

        const values = parseCSVLine(line);
        const row = {};

        headers.forEach((h, i) => {
            row[h] = values[i];
        });

        if (!row.reminder_day_before || !row.reminder_same_day) continue;

        reminders.push({
            date: row.collection_date,
            type: 'day_before',
            time: `${row.reminder_day_before} 19:00`,
            message: `Reminder: disposal is tomorrow (${row.exact_day_date}).`
        });

        reminders.push({
            date: row.collection_date,
            type: 'same_day',
            time: `${row.reminder_same_day} 08:00`,
            message: `Reminder: disposal is today (${row.exact_day_date}) at 8:00 AM.`
        });
    }

    return reminders;
}

client.on('ready', () => {
    console.log('Scheduler bot is alive and listening 24/7...');

    const targetGroupId = '120363406460624256@g.us';
    const timezone = 'Europe/London';
    const reminders = loadRemindersFromCSV();
    const sent = new Set();

    cron.schedule('* * * * *', async () => {
        const now = new Date();

        const pad = (n) => String(n).padStart(2, '0');
        const nowKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        for (const reminder of reminders) {
            if (reminder.time === nowKey && !sent.has(reminder.time)) {
                try {
                    await client.sendMessage(targetGroupId, reminder.message);
                    sent.add(reminder.time);
                    console.log(`Sent: ${reminder.time}`);
                } catch (error) {
                    console.error(`Failed to send: ${reminder.time}`, error);
                }
            }
        }
    }, {
        scheduled: true,
        timezone
    });
});

client.initialize();
