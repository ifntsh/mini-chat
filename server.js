const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Message = require('./models/message'); // 모델 파일 경로 확인

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected...');
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});

app.use(express.json());

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', async (msg) => {
    const newMessage = new Message({
      username: msg.username,
      message: msg.message,
    });

    await newMessage.save();

    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
