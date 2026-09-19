const express = require('express');
const router = express.Router();
const { getReply } = require('../../chatbot/controllers/chatbotController');

router.post('/chat', getReply);

module.exports = router;