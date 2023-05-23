const express = require('express');
const router = express.Router();
const golfControl = require('../../../controller/games/golf/golfController.js');

router.post('/create', golfControl.createRoom);
router.post('/join/:id', golfControl.joinRoom);
router.post('/removePlayer/:id', golfControl.removePlayer);
router.post('/flipCard/:id', golfControl.flipCard);
router.post('/swapCard/:id', golfControl.swapCard);
router.post('/drawCard/:id', golfControl.drawCard);
router.post('/burnCard/:id', golfControl.burnCard);
router.get('/state/:id', golfControl.getState);
router.get('/winner/:id', golfControl.getWinner);
router.post('/rematch/:id', golfControl.rematch);
router.post('/sendMessage/:id', golfControl.handleMessages);

router.get('/ranks', golfControl.getRanks);

module.exports = router;