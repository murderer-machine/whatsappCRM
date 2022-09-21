const { Client, Location, List, Buttons, LocalAuth } = require('./index')
const fs = require('fs')

const uniqid = require('uniqid')


const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on('message', async msg => {
    const { from, to, body, hasMedia, mediaKey } = msg
    const chat = await msg.getChat()
    if (hasMedia) {
        const attachmentData = await msg.downloadMedia()
        const ext = attachmentData.mimetype.split('/').pop()
        if (fs.existsSync(`./upload/${chat.isGroup ? chat.name : msg.from}`)) {
            console.log("El archivo EXISTE!")
        } else {
            fs.mkdirSync(`./upload/${chat.isGroup ? chat.name : msg.from}`, { recursive: true })
        }
        fs.writeFile(`./upload/${chat.isGroup ? chat.name : msg.from}/${uniqid()}.${ext}`, attachmentData.data, { encoding: 'base64' }, function (err) {
            console.log('File created')
            // msg.reply(`*informacion subida *Recuerde fotos nitidas y derechas*`)
        })
    }
})

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log(after); // message after it was deleted.
    if (before) {
        console.log(before); // message before it was deleted.
    }
});

client.on('message_revoke_me', async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    console.log(msg.body); // message before it was deleted.
});

client.on('message_ack', (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if (ack == 3) {
        // The message was read
    }
});

client.on('group_join', (notification) => {
    // User has joined or been added to the group.
    console.log('join', notification);
    notification.reply('User joined.');
});

client.on('group_leave', (notification) => {
    // User has left or been kicked from the group.
    console.log('leave', notification);
    notification.reply('User left.');
});

client.on('group_update', (notification) => {
    // Group picture, subject or description has been updated.
    console.log('update', notification);
});

client.on('change_state', state => {
    console.log('CHANGE STATE', state);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

