const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// LocalAuth saves your login session so you don't scan the QR code every single time
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate the QR code in your console terminal
client.on('qr', (qr) => {
    console.log('SCAN THIS QR CODE WITH YOUR WHATSAPP APP:');
    qrcode.generate(qr, { small: true });
});

// Once logged in, list all your chats to find the Group ID
client.on('ready', async () => {
    console.log('Logged in successfully! Fetching your chats...');
    
    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.isGroup);

    console.log('\n=== YOUR WHATSAPP GROUPS ===');
    groups.forEach(group => {
        console.log(`Group Name: ${group.name}`);
        console.log(`Group ID:   ${group.id._serialized}`);
        console.log('-----------------------------------');
    });
    
    console.log('\nCopy the Group ID for the next step, then press Ctrl+C to close this script.');
});

client.initialize();