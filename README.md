# mini-chat


### Node.js 설치
Node.js는 공식 웹사이트에서 다운로드하거나 Node Version Manager(NVM)를 사용하여 설치할 수 있습니다.

#### Node.js 공식 웹사이트에서 설치
1. [Node.js 공식 웹사이트](https://nodejs.org/)에 접속합니다.
2. LTS(Long Term Support) 버전을 다운로드하여 설치합니다.

#### NVM을 사용하여 설치 (Linux 및 macOS)
NVM(Node Version Manager)을 사용하면 Node.js 버전을 쉽게 관리할 수 있습니다.

1. NVM 설치
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    ```
2. NVM 로드
    ```bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    ```
3. Node.js 설치 및 사용
    ```bash
    nvm install node # 최신 버전 설치
    nvm use node # 최신 버전 사용
    ```

### Express 설치
Node.js를 설치한 후, Express와 기타 필요한 패키지를 설치합니다.

### 1. 프로젝트 초기화
프로젝트를 초기화하고 필요한 패키지를 설치합니다.

```bash
# 프로젝트 초기화
npm init -y

# 필요한 패키지 설치
npm install express mongoose dotenv socket.io
```

### 2. 프로젝트 폴더 구조 설정
다음과 같이 폴더 구조를 설정합니다.

```
/my-chat-app
  /config
    database.js
  /models
    message.js
  /public
    index.html
  /routes
    chat.js
  server.js
  .env
```

### 3. 환경 변수 설정
`.env` 파일을 생성하여 MongoDB 접속 URI를 설정합니다.

#### .env 파일
```env
MONGO_URI=mongodb://admin:password@localhost:27017/myDatabase
```

### 4. MongoDB 연결 설정 (`config/database.js`)
MongoDB 연결 설정을 위한 파일을 생성합니다.

#### `config/database.js`
```javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 5. 메시지 모델 생성 (`models/message.js`)
메시지 모델을 정의합니다.

#### `models/message.js`
```javascript
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);
```

### 6. 채팅 라우트 설정 (`routes/chat.js`)
기본 라우트를 설정합니다.

#### `routes/chat.js`
```javascript
const express = require('express');
const router = express.Router();
const Message = require('../models/message');

router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/messages', async (req, res) => {
  try {
    const newMessage = new Message({
      username: req.body.username,
      message: req.body.message
    });

    const message = await newMessage.save();
    res.json(message);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
```

### 7. 서버 설정 (`server.js`)
Express 서버를 설정하고 Socket.io를 추가합니다.

#### `server.js`
```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const Message = require('./models/message'); // 모델 파일 경로 확인

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

connectDB();

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
```

### 8. 클라이언트 코드 (`public/index.html`)
클라이언트 측 코드를 작성합니다.

#### `public/index.html`
```html
<!DOCTYPE html>
<html>
<head>
  <title>Chat App</title>
  <style>
    ul { list-style-type: none; margin: 0; padding: 0; }
    li { padding: 8px; margin-bottom: 10px; background-color: #f3f3f3; }
  </style>
</head>
<body>
  <ul id="messages"></ul>
  <form id="form" action="">
    <input id="input" autocomplete="off" /><button>Send</button>
  </form>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    var socket = io();
    var form = document.getElementById('form');
    var input = document.getElementById('input');
    var messages = document.getElementById('messages');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (input.value) {
        const msg = { username: 'User', message: input.value };
        socket.emit('chat message', msg);
        input.value = '';
      }
    });

    socket.on('chat message', function(msg) {
      var item = document.createElement('li');
      item.textContent = `${msg.username}: ${msg.message}`;
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    });
  </script>
</body>
</html>
```

### 9. 서버 실행
이제 서버를 실행합니다.

```bash
node server.js
```

브라우저에서 `http://localhost:5000`을 열어 채팅 애플리케이션이 정상적으로 동작하는지 확인합니다.

이제 모든 설정이 완료되었습니다.
