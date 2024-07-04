// routes/chat.js
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
