const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const { Server } = require('socket.io');
const { createServer } = require('node:http')

const PORT = process.env.PORT || 5001

const app = express().use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))

const server = createServer(app)
const io = new Server(server)


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
