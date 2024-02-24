const cors = require('cors')
const express = require('express')
const { Server } = require('socket.io');
const { createServer } = require('node:http')

const PORT = process.env.PORT || 5001

const app = express()
app.use(cors({
  origin: '*'
}))
const server = createServer(app, {
  cors: {
    origin: '*'
  }
})
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
