import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import cors from 'cors'

const port = 4000
const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(cors())

app.get('/', (req, res) => {
  console.log("new client request to seek server status")
  res.send(`Running successfull on heroku; time: ${Date()} `)
});

io.on('connection', (socket) => {
  console.log("new client connected to websocket");
  socket.on('disconnect', () => {
    console.log('user got disconnected.')
  })

  socket.on('video_data', (videoChunk) => {
    io.emit('broadcast_data', videoChunk)
  })
})

server.listen(port, () => {
  console.log(`Websocket server created on port ${port}`)
})