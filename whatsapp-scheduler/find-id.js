const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

// Name of the group you are searching for
const TARGET_GROUP_NAME = 'TARGET_GRP_NAME'; // This is place holder, this is what needs to be updated, OR shift the group name to a constants.txt file

/**
 * Helper function to find a group by its exact name
 */
async function findGroupByName(clientInstance, name) {
    const chats = await clientInstance.getChats();
    // Filters for groups first, then checks for an exact name match
    return chats.find(chat => chat.isGroup && chat.name === name);
}

// 1. Generate QR Code
client.on('qr', (qr) => {
    console.log('SCAN THIS QR CODE WITH YOUR WHATSAPP APP:');
    qrcode.generate(qr, { small: true });
});

// 2. Search once logged in
client.on('ready', async () => {
    console.log(`Logged in successfully! Searching for "${TARGET_GROUP_NAME}"...`);
    
    try {
        const group = await findGroupByName(client, TARGET_GROUP_NAME);

        console.log('\n=== SEARCH RESULT ===');
        if (group) {
            console.log(`🎉 Found the group!`);
            console.log(`Group Name: ${group.name}`);
            console.log(`Group ID:   ${group.id._serialized}`);
            console.log('\nCopy that Group ID for your other scripts.');
        } else {
            console.log(`❌ Could not find a group named "${TARGET_GROUP_NAME}".`);
            console.log('Make sure the spelling and spacing match exactly what is on your phone.');
        }
        
        console.log('\nPress Ctrl+C to close this script.');
    } catch (error) {
        console.error('Error searching for group:', error);
    }
});

client.initialize();
