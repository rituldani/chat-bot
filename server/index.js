import express from 'express';
import mongoDBConnect from './mongoDB/connection.js';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import Chat from './models/chatModel.js'
import messageRoutes from './routes/message.js';
import { Server } from "socket.io";
// import * as Server from 'socket.io';
import dotenv from 'dotenv';
import http from 'http';
dotenv.config();
const app = express();
const PORT=process.env.PORT || 8000

// const cors = require('cors');

// app.use(cors({
//   origin: 'https://clients-cwcft7wb2-ritul-danis-projects.vercel.app', // Vercel frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true, // if you're using cookies
// }));
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Incoming Origin:", origin);
      if (
        !origin || // allow tools like Postman
        /vercel\.app$/.test(origin) || // allow all *.vercel.app
        /localhost:\d{4}$/.test(origin) // allow localhost dev
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://clients-lz2vzlhdr-ritul-danis-projects.vercel.app',
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// }));


app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});
app.use('/auth', userRoutes);
app.use('/api', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api', userRoutes);

mongoose.set('strictQuery', false);
mongoDBConnect();

const server = http.createServer(app);
// const server = app.listen(PORT, () => {
//   console.log(`Server Listening at PORT - ${PORT}`);
// });
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("🔌 New socket connected:", socket.id);

  socket.on("setup", (userData) => {
    console.log("📥 Setup event received");
    console.log("🧠 User data:", userData);

    if (!userData || !userData._id) {
      console.error("❌ Invalid userData:", userData);
      return;
    }

    socket.join(userData._id.toString());
    console.log(`✅ ${userData.name} joined room ${userData._id}`);
    socket.emit("connected");
  });

  socket.on("new message", async (newMessageReceived) => {
    try {
      const chatId = typeof newMessageReceived.chatId === "object"
        ? newMessageReceived.chatId._id
        : newMessageReceived.chatId;

      const chat = await Chat.findById(chatId).populate("users");

      if (!chat?.users) return console.log("❌ chat.users undefined");

      chat.users.forEach((user) => {
        const receiverId = user._id.toString();
        const senderId = newMessageReceived.sender._id.toString();

        if (receiverId === senderId) return;

        console.log("📡 Emitting message to:", receiverId);
        console.log("🔍 Is receiver joined?", io.sockets.adapter.rooms.get(receiverId));

        socket.to(receiverId).emit("message received", newMessageReceived);
      });
    } catch (err) {
      console.error("💥 Socket error on new message:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });

  socket.on('join room', (room) => {
    socket.join(room);
    
  });
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
  
});

// const server = http.createServer(app);
// const io = new Server.Server(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: process.env.BASE_URL || "http://localhost:3000",
//   },
// });
// io.on('connection', (socket) => {
//   socket.on('setup', (userData) => {
//     socket.join(userData.id);
//     socket.emit('connected');
//   });
//   socket.on('join room', (room) => {
//     socket.join(room);
//   });
//   socket.on('typing', (room) => socket.in(room).emit('typing'));
//   socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

//   socket.on('new message', (newMessageRecieve) => {
//     var chat = newMessageRecieve.chatId;
//     if (!chat.users) {
//       console.log('chats.users is not defined');
//       return;
//     }
  
//     chat.users.forEach((user) => {
//       if (user._id.toString() === newMessageRecieve.sender._id.toString()) return;
//       console.log(`📤 Sending message to ${user._id}`);
//       socket.in(user._id).emit('message recieved', newMessageRecieve);
//     });
//   });
  
// });
// server.listen(PORT, () => {
//   console.log(`✅ Server Listening at PORT - ${PORT}`);
// });