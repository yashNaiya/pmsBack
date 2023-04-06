const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const path = require('path')
require("./Connection/connection")
const dotenv = require('dotenv')
const PORT = process.env.PORT || 9002
dotenv.config({ path: "././config.env" })
app.use(cookieParser())
app.use(express.json())

var cors = require('cors')
const origin = ["https://inquisitive-cocada-be43aa.netlify.app/","http://localhost:3000"]
app.use(cors({
    credentials: true,
    origin: origin,
    methods: ["GET", "POST"],
    preflightContinue: true,
}));

app.use(require('./router/auth'))


const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Be Started at port ${process.env.PORT}`)
})

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
      origin: origin,
      // credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
      });

      socket.on("new message", (newMessageRecieved,members,taskId) => {
        console.log(newMessageRecieved)
        var chat = newMessageRecieved;
        console.log(members)
        // if (!chat.members) return console.log("chat.members not defined");
    
        members.forEach((user) => {
          if (user._id == newMessageRecieved.sender._id) return;
            console.log(newMessageRecieved)
          socket.in(user._id).emit("message recieved", newMessageRecieved);
          socket.in(user._id).emit("ping", taskId);
        });
      });

  

      
  })