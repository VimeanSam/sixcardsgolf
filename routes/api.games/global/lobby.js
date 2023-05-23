const express = require('express');
const router = express.Router();
const lobbyControl = require('../../../controller/games/global/lobbyController.js');

router.get('/rooms', lobbyControl.listRooms);

module.exports = router;