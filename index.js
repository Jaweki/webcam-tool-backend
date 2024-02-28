const cors = require('cors');
const express = require('express');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",  // Specify your client's origin
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "*",
  methods: ["GET, POST"]
}))

const PORT = process.env.PORT || 5001;

let openRoomIds = null;

app.get("/open-rooms", (req, res) => {
  console.log("New User seeked for Open Room Id: ", openRoomIds)
  res.json(openRoomIds)
})

const peerConncetionSignals = {
  callerSocketId: "",
  callerSdpOffer: "",
  calleeSdpAnswer: "",
  callerIcecandidates: [] 
}

io.on('connection', (socket) => {
  const clientId = socket.handshake.query.t

  console.log("New user connected to WebSocket as: ", clientId);

  socket.on('disconnect', () => {
    console.log('A user got disconnected');
  });

  // Caller event handlers
  socket.on("set_caller_id", (callerId) => {
    peerConncetionSignals.callerSocketId = callerId
    openRoomIds = callerId;
    io.emit("available_room_session", callerId)
    console.log("new caller: ", callerId)
  })

  socket.on("set_caller_icecandidate", (RTCIceCandidate) => {

    peerConncetionSignals.callerIcecandidates.forEach(candidateObj => {
      if (candidateObj.candidate === RTCIceCandidate.candidate) {
        return;
      } else {
        peerConncetionSignals.callerIcecandidates.push(RTCIceCandidate)
        io.emit("caller_icecandidates", RTCIceCandidate)
      }
    })
    
  })

  socket.on('caller_sdp_offer', (incomingCallerSDPOffer) => {
    
    peerConncetionSignals.callerSdpOffer = incomingCallerSDPOffer
  
  });


  socket.on("callee_sdp_answer", (calleeSdpAnswer) => {
    console.log("callee responded with sdp answer: ", calleeSdpAnswer)
    io.emit("caller_awaited_sdp_answer", calleeSdpAnswer)
  })


  // Callee event handlers
  socket.on("request_caller_sdp_offer", (roomID) => {

    if (peerConncetionSignals.callerSocketId == roomID) {

      socket.emit("available_caller_sdp_offer", peerConncetionSignals.callerSdpOffer)
    } else {
      socket.emit("status_update", "Room Session Expired")
    }
  })

  socket.on("request_caller_ice_candidates", (roomId) => {

    console.log("callee ruquesting caller related ice candidates: ", peerConncetionSignals.callerSocketId, roomId)
    if (peerConncetionSignals.callerSocketId == roomId) {
      peerConncetionSignals.callerIcecandidates.forEach(iceCandidate => {
        socket.emit("caller_icecandidates", iceCandidate)
      } )
    }
  })

});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
