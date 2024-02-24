const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const { Server } = require('socket.io');
const { createServer } = require('node:http')

const app = express()
const server = createServer(app)
const io = new Server(server)

const PORT = process.env.PORT || 5001


server.use(express.static(path.join(__dirname, 'public')))
server.set('views', path.join(__dirname, 'views'))
server.set('view engine', 'ejs')
server.get('/', (req, res) => res.render('pages/index'))
server.get('/cool', (req, res) => res.send(cool()))

io.on('connection', (socket) => {
  console.log("new use connected to Websocket")

  socket.on('disconnect', () => {
    console.log('a user got disconnected')
  })

  socket.on('video_data', (videoChunk) => {
    io.emit('broadcast_data', videoChunk)
  })
})

server.listen(PORT, () => console.log(`Listening on ${ PORT }`))
