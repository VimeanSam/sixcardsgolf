const Game = require('../../../models/game.js');
const User = require('../../../models/user.js');
const conf = require('../../../config/config.js')
let GameEngine = require('../../../gameLogic/golf/golf_game');
let cards = require('../../../constants/golf/golf_cards.js');
var time = {};
var countdown = {};

/* ROOMS ACTIONS */
module.exports.createRoom = async (req, res) => {
    try{
        const io = req.app.get('io');
        //request body
        const {uid, roomname, settings} = req.body;
        const user = await User.findOne({_id: uid});
        var players = {};
        if(user){
            //card configuration
            var deck = cards;
            if(settings.deck === "double"){
                deck = deck.concat(deck);
            }
            deck = GameEngine.shufflePack(deck.slice());
            //init player
            let playerHand = GameEngine.draw(deck, 6, '', true);
            players[uid] = GameEngine.newPlayer(uid, user.username, user.avatar, true, true, true, playerHand, 0, 0, Date.now());
        
            //formattings
            let roomID = Date.now().toString()+Math.random().toString(36).substr(2, 9);

            //automatically draw a card from the deck
            let burnt = GameEngine.draw(deck, 1, '', true);

            //things to insert in db
            var state = {canJoin: true, endgame: false, roundover: false, gameover: false, burntPile: burnt, deck: deck, players: players, currentTurn: Object.keys(players)[0], winners: ""}
            var toInsert = {
                rid: roomID,
                name: roomname, 
                creator: {_id: user._id, username: user.username, avatar: user.avatar, wins: user.wins, totalPoints: user.totalPoints, gamePlayed: user.gamesPlayed}, 
                messages: [{_id: 'BOT', from: "server", avatar: "bot.jpg", text: `${user.username} has joined the game.`,  color: 'black', timestamp: Date.now()}],
                settings: settings,
                state: state,
                type: "golf"
            }
            time[roomID] = conf.timer;
            let newGame = new Game(toInsert);
            const savedData = await newGame.save();
            res.status(200).json(savedData);
            io.of('/lobby').emit('LIST_ROOMS'); 
        }else{
            res.status(500).json({error: 'player not found'});
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.joinRoom = async (req, res) => {
    try{
        const io = req.app.get('io');
        const endpoint = `/game/golf/${req.params.id}`;
        const uid = req.body.uid;
        const game = await Game.findOne({rid: req.params.id});
        const user = await User.findOne({_id: uid});
        //console.log(game);
        let exist = false;
        if(user){
            if(game){
                let players = game.state.players;
                let currentTurn = game.state.currentTurn;
                //console.log(players);
                if(players[uid]){
                    exist = true;
                }
                if(!exist && Object.keys(players).length < parseInt(game.settings.occupancy)){
                    let roomDeck = game.state.deck;
                    let state = game.state;
                    if(Object.keys(players).length < 2 && currentTurn !== ""){
                        players[currentTurn].last_active = Date.now();
                    }
                    let playerHand = GameEngine.draw(roomDeck, 6, '', true);
                    players[uid] = GameEngine.newPlayer(uid, user.username, user.avatar, true, true, true, playerHand, 0, 0, Date.now());
                    state.players = players;
                    state.deck = roomDeck;
                    var msg = {_id: 'BOT', from: "server", avatar: "bot.jpg", text: `${user.username} has joined the game.`, color: 'black', timestamp: Date.now()};
                    let target = {rid: req.params.id};
                    let updater = {$push: {messages: msg}, state: state};
                    await Game.updateOne(target, updater).exec();
                    res.status(200).json(game);
                    io.of('/lobby').emit('LIST_ROOMS'); 
                    io.of('/game').to(endpoint).emit('UPDATE_STATE', {event: 'USER_JOINED'});
                }else{
                    res.status(200).json(game);
                }
            }else{
                res.status(500).json({error: 'room not found...'});
            }
        }else{
            res.status(500).json({error: 'player not found'});
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.getState = async (req, res) => {
    try{
        const game = await Game.findOne({rid: req.params.id});
        const io = req.app.get('io');
        const endpoint = `/game/golf/${req.params.id}`;
        let currentTime = (!time[req.params.id]? 120: time[req.params.id]);
        if(game){
            let players = game.state.players;
            let currentTurn = game.state.currentTurn;
            if(Object.keys(players).length >= 2){
                if(players[currentTurn]){
                    console.log('Game starting!!');
                    //timer(req.params.id, io, true);
                    if(!countdown[req.params.id]){
                        countdown[req.params.id] = setInterval(function(){
                            currentTime--;
                            time[req.params.id] = currentTime;
                            if(currentTime === -1){
                                io.of('/game').to(endpoint).emit('PLAYER_TIMEOUT', {name: players[currentTurn].username, id: players[currentTurn].uid});
                                clearInterval(countdown[req.params.id]);
                                delete countdown[req.params.id];
                            }else{
                                io.of('/game').to(endpoint).emit('UPDATE_TIMER', currentTime);
                            }       
                        }, 1000);
                    }
                }
            }else{
                console.log('not enough players, stopping timer....');
                //timer(req.params.id, io, false);
                clearInterval(countdown[req.params.id]);
                delete countdown[req.params.id];
            }
            res.status(200).json({messages: game.messages, theme: game.settings.cardTheme, ...game.state});
        }else{
            res.status(500).json({error: 'room not found...'});
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.handleMessages = async (req, res) => {
    try{
        const {uid, username, message} = req.body;
        if(!uid || !username || !message){
            res.status(400).json({error: "DATA"});
        }else{
            const game = await Game.findOne({rid: req.params.id});
            const io = req.app.get('io');
            const endpoint = `/game/golf/${req.params.id}`;
            let colors = ['red', 'blue', 'rgb(230,149,0)', 'green'];
            let players = game.state.players;
            let avatar = ""
            if(players[uid]){
                avatar = players[uid].avatar
            }
            var idx = Object.keys(players).indexOf(uid);
            if(idx < 0){
                idx = 0
            }
            var msg = {_id: uid, from: username, avatar: avatar, text: message,  color: colors[idx], timestamp: Date.now()};
            if(game){
                let target = {rid: req.params.id};
                let updater = {$push: {messages: msg}};
                await Game.updateOne(target, updater).exec();
                res.status(200).json({status: 'ok'});
                io.of('/game').to(endpoint).emit('UPDATE_STATE', {event: 'RECEIVE_MESSAGE'});
            }else{
                res.status(500).json({error: 'room not found...'});
            }
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.getWinner = async (req, res) => {
    try{
        const io = req.app.get('io');
        const endpoint = `/game/golf/${req.params.id}`;
        const game = await Game.findOne({rid: req.params.id});
        let state = game.state;
        if(game){
            //get winners and check to see if any players exceed the maximum points
            let evt = 'ROUND_OVER';
            let players = game.state.players;
            let winners = GameEngine.getWinner(players, 'round');
            let names = winners.map( (player) => player.username);
            let str = names.join(', ');
            state.winners = str; 
            state.players = GameEngine.calculateTotal(players);
            let canJoin = true
            //check the point differentiate from the maximum points from the player who is currently losing. If the differentiate is under 20, 
            //the game is too close to end and nobody can freshly join for a cheeky victory
            var pointLimits = parseInt(game.settings.scorelimit);
            var total_points = Object.values(players).map((data)=>{return data.total});
            var max_points = Math.max(...total_points)
            var diff = pointLimits - max_points
            if(diff < 30){
                canJoin = false
            }
            if(max_points >= pointLimits){
                console.log("GAME OVER")
                winners = GameEngine.getWinner(players, 'game');
                names = winners.map( (player) => player.username);
                str = names.join(', ');
                console.log("WINNER", str)
                state.gameover = true;
                state.winners = str; 
                evt = 'GAME_OVER';
                canJoin = true
            }
            state.canJoin = canJoin
            let target = {rid: req.params.id};
            let updater = {state: state};
            await Game.updateOne(target, updater).exec();
            if(evt === 'GAME_OVER'){
                let ids = winners.map( (player) => player.uid);
                let bulkwriteArr = [];
                for (const [key, data] of Object.entries(players)) {
                    let win = {}
                    if(ids.includes(key)){
                        console.log("HERE")
                        win = {wins: 1}
                    }
                    bulkwriteArr.push({
                        updateOne: {
                        filter: {_id: data.uid}, 
                        update: {$inc: {...win, totalPoints: data.total, gamesPlayed: 1}}
                    }})
                }
                console.log("BULKWRITE ARR", bulkwriteArr)
                await User.bulkWrite(bulkwriteArr);
            }
            res.status(200).json({status: 'ok', winners: str});
            clearInterval(countdown[req.params.id]);
            io.of('/game').to(endpoint).emit('UPDATE_STATE', {event: evt});
            io.of('/lobby').emit('LIST_ROOMS'); 
        }else{
            res.status(500).json({error: 'room not found...'});
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.rematch = async (req, res) => {
    try{
        const io = req.app.get('io');
        const endpoint = `/game/golf/${req.params.id}`;
        const game = await Game.findOne({rid: req.params.id});
        const flag = req.body.flag;
        if(game){
            //handle game Deck
            var deck = cards;
            const settings = game.settings;

            if(settings.deck === "double"){
                deck = deck.concat(deck);
            }
            deck = GameEngine.shufflePack(deck.slice());
            //burnt pile
            let burnt = GameEngine.draw(deck, 1, '', true);

            //players
            let players = game.state.players;

            for(var key in players){
                if(players.hasOwnProperty(key)){
                    let playerHand = GameEngine.draw(deck, 6, '', true);
                    players[key].firstRound = true;
                    players[key].canDraw = true;
                    players[key].canSelect = true;
                    players[key].hand = playerHand;
                    players[key].score = 0;
                    if(flag === 'GAME'){
                        players[key].total = 0;
                    }
                    players[key].last_active = Date.now();
                }
            }
            var state = {canJoin: game.state.canJoin, endgame: false, roundover: false, gameover: false, burntPile: burnt, deck: deck, players: players, currentTurn: Object.keys(players)[0], winners: ""}
            time[req.params.id] = conf.timer;
            delete countdown[req.params.id];
            let target = {rid: req.params.id};
            let updater = {state: state};
            await Game.updateOne(target, updater).exec();
            res.status(200).json({status: 'ok'});
            io.of('/lobby').emit('LIST_ROOMS'); 
            io.of('/game').to(endpoint).emit('UPDATE_STATE', {event: 'REMATCH'});
        }else{
            res.status(500).json({error: 'room not found...'});
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.removePlayer = async (req, res) => {
    try{
        const io = req.app.get('io');
        const endpoint = `/game/golf/${req.params.id}`;
        const game = await Game.findOne({rid: req.params.id});
        if(game){
            let players = game.state.players;
            let pid = req.body.pid;
            let flag = req.body.flag;
            let state = game.state;
            console.log("disconnected ID "+pid)
            if(players[pid]){
                //send message in the chat
                var msg = {_id: 'BOT', from: "server", avatar: "bot.jpg", text: `${players[pid].username} ${flag === "TIMEOUT"? 'has been removed for taking too long' : 'disconnected'}.`,  color: 'black', timestamp: Date.now()};
                //get the index of the disconnected players
                let index = Object.keys(players).indexOf(pid);
                //put the disconnected player's hand back in the main deck and shuffle it
                let gameDeck = state.deck;
                const unflipped_cards = players[pid].hand.map(obj => {
                    if (obj.flipped) {
                    obj.flipped=false;
                    }
                    return obj;
                })
                gameDeck = gameDeck.concat(unflipped_cards);
                gameDeck = GameEngine.shufflePack(gameDeck.slice());
                state.deck = gameDeck;
                let newidx = nextTurn(index, players, true);
                //remove player
                delete players[pid];
                //if there are no players left, delete the game room as it's no longer active
                if(Object.keys(players).length === 0){
                    await Game.deleteOne({rid: req.params.id});
                }else{
                    //otherwise, check for players who flipped all cards, get next turn and update the room and end the game if every player flipped all their cards
                    //check if all players flipped their cards over
                    /* TO DO */
                    //get next turn if not all players flipped their cards over
                    let new_pid = Object.keys(players)[newidx];
                    time[req.params.id] = conf.timer;
                    clearInterval(countdown[req.params.id]);
                    delete countdown[req.params.id];
                    console.log("new turn idx "+newidx)
                    console.log("new turn id "+new_pid)
                    players[new_pid].last_active = Date.now();
                    players[new_pid].canDraw = true;
                    players[new_pid].canSelect = true;
                    state.currentTurn = new_pid;
                    state.players = players;
                    let target = {rid: req.params.id};
                    let updater = {$push: {messages: msg}, state: state};

                    if(state.endgame){
                        let num_allFlipped = GameEngine.allFlippedTotal(players);
                        if(num_allFlipped === Object.keys(players).length){
                            state.currentTurn = "";
                            state.roundover = true;
                        }
                    }
                    await Game.updateOne(target, updater).exec();
                    res.status(200).json({status: 'ok', roundover: state.roundover});
                }
                //clear timer interval
                //timer(req.params.id, io, false);
                //emit sockets
                io.of('/lobby').emit('LIST_ROOMS'); 
                io.of('/game').to(endpoint).emit('UPDATE_STATE', {event: 'USER_REMOVED', uid: pid, flag: flag});
            }else{
                res.status(500).json({error: 'player not found..'});
            }
        }else{
            res.status(500).json({error: 'room not found...'});
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

/* PLAYER ACTIONS */

module.exports.flipCard = async (req, res) => {
    try{
        const io = req.app.get('io');
        const endpoint = `/game/golf/${req.params.id}`;
        const game = await Game.findOne({rid: req.params.id});
        if(game){
            let players = game.state.players;
            const pid = req.body.pid;
            const index = req.body.index;
            let state = game.state;
            if(players[pid]){
                if(players[pid].firstRound){
                    console.log('first round, flip 2 cards')
                    //check to make sure players flip 2 cards over, then check if they draw cards and see if they keep or burn
                    let hand = players[pid].hand.slice();
                    hand[index].flipped = true;
                    let flippedCounter = hand.filter(card => card.flipped === true);
                    if(flippedCounter.length === 2){
                        players[pid].firstRound = false;
                    }
                    players[pid].last_active = Date.now();
                    players[pid].score = GameEngine.getScore(hand);
                }
                if(state.endgame && !players[pid].canDraw && !players[pid].canSelect){
                    console.log('test')
                    //player must flip their remaining facedown cards over after they draw and keep/burn the card
                    let hand = players[pid].hand.slice();
                    hand[index].flipped = true;
                    players[pid].last_active = Date.now();
                    players[pid].score = GameEngine.getScore(hand);
                    let allFlipped = GameEngine.allFlipped(players[pid]);
                    if(allFlipped){
                        //check if every players have all their cards face up
                        let num_allFlipped = GameEngine.allFlippedTotal(players);
                        if(num_allFlipped === Object.keys(players).length){
                            state.currentTurn = "";
                            state.roundover = true;
                            //timer(req.params.id, io, false);
                        }else{
                            //go to next player
                            let index = Object.keys(players).indexOf(pid);
                            let newidx = nextTurn(index+1, players, false);
                            time[req.params.id] = conf.timer;
                            clearInterval(countdown[req.params.id]);
                            delete countdown[req.params.id];
                            let new_pid = Object.keys(players)[newidx];
                            players[new_pid].last_active = Date.now();
                            players[new_pid].canDraw = true;
                            players[new_pid].canSelect = true;
                            state.currentTurn = new_pid;
                            console.log("next turn: "+players[new_pid].username);
                        }
                    }
                }
                //update points
                state.players = players;
                let target = {rid: req.params.id};
                let updater = {state: state};
                await Game.updateOne(target, updater).exec();
                res.status(200).json({status: 'ok', roundover: state.roundover});
                io.of('/game').to(endpoint).emit('UPDATE_STATE', {event: 'USER_FLIP_CARD'});
            }else{
                res.status(500).json({error: 'player not found..'});
            }
        }else{
            res.status(500).json({error: 'room not found...'});
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.swapCard = async (req, res) => {
    try{
        const io = req.app.get('io');
        const endpoint = `/game/golf/${req.params.id}`;
        const game = await Game.findOne({rid: req.params.id});
        if(game){
            let players = game.state.players;
            let state = game.state;
            const pid = req.body.pid;
            const index = req.body.index;
            let pile = state.burntPile.slice();
            const swappedCard = pile.pop();
            swappedCard.flipped = true;
            if(players[pid]){
                //get the index of the selected hand and replace it with the selected card
                let hand = players[pid].hand.slice();
                //put player's hand onto the burnt pile
                pile.push(hand[index])
                hand[index] = swappedCard;
                players[pid].hand = hand;
                // console.log(hand[index]);
                players[pid].canDraw = false;
                players[pid].canSelect = false;
                players[pid].last_active = Date.now();
                players[pid].score = GameEngine.getScore(hand);
                let allFlipped = GameEngine.allFlipped(players[pid]);
                if(allFlipped){
                    state.endgame = true;
                    state.canJoin = false
                }
                //after, rotate to get next turn if not in endgame phase
                if(!state.endgame || allFlipped){
                    let index = Object.keys(players).indexOf(pid);
                    let newidx = nextTurn(index+1, players, false);
                    time[req.params.id] = conf.timer;
                    clearInterval(countdown[req.params.id]);
                    delete countdown[req.params.id];
                    // console.log(newidx);
                    let new_pid = Object.keys(players)[newidx];
                    players[new_pid].last_active = Date.now();
                    players[new_pid].canDraw = true;
                    players[new_pid].canSelect = true;
                    
                    state.currentTurn = new_pid;
                    console.log("next turn: "+players[new_pid].username);
                }
                if(state.endgame){
                    let num_allFlipped = GameEngine.allFlippedTotal(players);
                    if(num_allFlipped === Object.keys(players).length){
                        state.currentTurn = "";
                        state.roundover = true;
                        //timer(req.params.id, io, false);
                    }
                }
                state.players = players;
                state.burntPile = pile;
                let target = {rid: req.params.id};
                let updater = {state: state};
                await Game.updateOne(target, updater).exec();
                res.status(200).json({status: 'ok', roundover: state.roundover, topCard: pile[pile.length-1]});
                io.of('/game').to(endpoint).emit('UPDATE_STATE', {event: 'USER_SWAP_CARD'});
                io.of('/lobby').emit('LIST_ROOMS'); 
            }else{
                res.status(500).json({error: 'player not found..'});
            }
        }else{
            res.status(500).json({error: 'room not found...'});
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.drawCard = async (req, res) => {
    try{
        const io = req.app.get('io');
        const endpoint = `/game/golf/${req.params.id}`;
        const game = await Game.findOne({rid: req.params.id});
        if(game){
            let players = game.state.players;
            const pid = req.body.pid;
            let state = game.state;
            let deck = state.deck;
            let burnt_pile = state.burntPile;
            if(players[pid]){
                if(players[pid].canDraw){
                    players[pid].canDraw = false;
                    if(deck.length > 1){
                        let drawn_card = GameEngine.draw(deck, 1, '', true);
                        burnt_pile.push(drawn_card[0]);
                        state.burntPile = burnt_pile;
                        let target = {rid: req.params.id};
                        let updater = {state: state};
                        await Game.updateOne(target, updater).exec();
                        res.status(200).json({status: 'ok', topCard: drawn_card[0]});
                        io.of('/game').to(endpoint).emit('UPDATE_STATE', {event: 'USER_DRAW_CARD'});
                    }else{
                        //In the case of the main deck running out, reshuffle the burnt pile excluding the drawn card
                        let drawn_card = GameEngine.draw(deck, 1, '', true);
                        console.log("RESHUFFLING")
                        //set the main deck to the shuffled burnt pile
                        state.deck = GameEngine.shufflePack(burnt_pile)
                        //set the burnt pile to the drawn card
                        let new_burnt_pile = []
                        new_burnt_pile.push(drawn_card[0])
                        state.burntPile = new_burnt_pile
                        let target = {rid: req.params.id};
                        let updater = {state: state};
                        await Game.updateOne(target, updater).exec();
                        res.status(200).json({status: 'ok', topCard: drawn_card[0]});
                        io.of('/game').to(endpoint).emit('UPDATE_STATE', {event: 'RESHUFFLE_DECK'});
                    }
                }
            }else{
                res.status(500).json({error: 'player not found..'});
            }
        }else{
            res.status(500).json({error: 'room not found...'});
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.burnCard = async (req, res) => {
    try{
        const io = req.app.get('io');
        const endpoint = `/game/golf/${req.params.id}`;
        const game = await Game.findOne({rid: req.params.id});
        if(game){
            let players = game.state.players;
            const pid = req.body.pid;
            let state = game.state;
            if(players[pid]){
                if(!state.endgame){
                    let index = Object.keys(players).indexOf(pid);
                    let newidx = nextTurn(index+1, players, false);
                    time[req.params.id] = conf.timer;
                    clearInterval(countdown[req.params.id]);
                    delete countdown[req.params.id];
                    console.log(newidx);
                    let new_pid = Object.keys(players)[newidx];
                    players[new_pid].last_active = Date.now();
                    players[new_pid].canDraw = true;
                    players[new_pid].canSelect = true;
                    state.currentTurn = new_pid;
                    state.players = players;
                    console.log("next turn: "+players[new_pid].username)
                }else{
                    console.log("NEW ADDITION")
                    players[pid].canDraw = false;
                    players[pid].canSelect = false;
                }
                    let target = {rid: req.params.id};
                    let updater = {state: state};
                    await Game.updateOne(target, updater).exec();
                    res.status(200).json({status: 'ok'});
                    io.of('/game').to(endpoint).emit('UPDATE_STATE', {event: 'USER_BURN_CARD'});
            }else{
                res.status(500).json({error: 'player not found..'});
            }
        }else{
            res.status(500).json({error: 'room not found...'});
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.getRanks = async (req, res) =>{
    try{
        let data = await User.aggregate([{$match: {gamesPlayed: {$gte: 1}}}, {$sort: {wins: -1}}, {$project : { _id: 0, __v: 0 , email: 0, password: 0}}, {$limit: 10}]);
        res.status(200).json(data);
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

/* HELPER FUNCTION */

let nextTurn = (idx, players, disconnected) =>{
    if(disconnected){
        //if the first or last person in the room timedout, player 1 gets the turn
        if(idx === 0 || idx >= Object.keys(players).length-1){
            return 0;
        }else{
            //otherwise player next to disconnected player gets a turn
            return idx;
        }
    }else{
        //general turn. No disconnection
        if(idx >= Object.keys(players).length){
            return 0;
        }else{
            return idx;
        }
    }
}