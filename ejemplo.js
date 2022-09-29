const { Client, Location, List, Buttons, LocalAuth } = require('./index')

const fs = require('fs')
const uniqid = require('uniqid')
const http = require('http')
const { Server } = require('socket.io')
const fetch = require('node-fetch')

const express = require('express')
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
    }
})
const cors = require('cors')

app.use(cors())

var socket_

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
})
client.initialize()
client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message)
})
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr)
})
client.on('authenticated', () => {
    console.log('AUTHENTICATED')
})
client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg)
})
client.on('ready', () => {
    console.log('READY');
})
const insertar = async (id, mensaje) => {
    const response = await fetch(`http://localhost:3002/api/mensajeswhatsapp/`,
        {
            method: 'POST',
            body: JSON.stringify({
                puntosVentaId: id,
                mensaje: mensaje
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    const data = await response.json()
}
client.on('message', async msg => {
    const { from, to, body, hasMedia, mediaKey } = msg
    const chat = await msg.getChat()
    console.log('entre al mensaje')
    if (body) {
        console.log(body)
        socket_.emit('message', `${body}`)
        insertar(2, body)
    }
    if (hasMedia) {
        const attachmentData = await msg.downloadMedia()
        const ext = attachmentData.mimetype.split('/').pop()
        if (fs.existsSync(`./upload/${chat.name}-${msg.from}`)) {
            console.log("El archivo EXISTE!")
        } else {
            fs.mkdirSync(`./upload/${chat.name}-${msg.from}`, { recursive: true })
        }
        const nombreArchivo = uniqid()
        fs.writeFile(`./upload/${chat.name}-${msg.from}/${nombreArchivo}.${ext}`, attachmentData.data, { encoding: 'base64' }, function (err) {
            console.log('File created')
            socket_.emit('message', `${chat.name}-${msg.from}`)
            insertar(2, `${nombreArchivo}.${ext}`)
        })
    }
})
client.on('change_state', state => {
    console.log('CHANGE STATE', state)
})
client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason)
})
io.on('connection', (socket) => {
    console.log('a user connected')
    socket_ = socket
})
server.listen(3001, () => {
    console.log('listening on *:3001')
})