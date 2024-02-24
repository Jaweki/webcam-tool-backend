const cors = require('cors')
const express = require('express')
const { createServer } = require('node:http')

const app = express()
const server = createServer(app)

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001

io.on('connection', (socket) => {
  console.log("new user connected to Websocket")

  socket.on('disconnect', () => {
    console.log('a user got disconnected')
  })

  socket.on('video_data', (videoChunk) => {
    if (videoChunk) {console.log(typeof videoChunk, videoChunk)}
    io.emit('broadcast_data', videoChunk)
  })
})

server.listen(PORT, () => console.log(`Listening on ${ PORT }`))
