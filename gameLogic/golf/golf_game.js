function shufflePack(pack) {
    var i = pack.length, j, tempi, tempj;
    if (i === 0) return false;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        tempi = pack[i];
        tempj = pack[j];
        pack[i] = tempj;
        pack[j] = tempi;
     }
    return pack;
}

function draw(pack, amount, hand, initial) {
    var cards = new Array();
    cards = pack.slice(0, amount); 
    pack.splice(0, amount); 
    if (!initial) {
      hand.push.apply(hand, cards);
    }
    return cards;
}

function compare(upperslot, lowerslot){
   if(upperslot.flipped && lowerslot.flipped){
       if(upperslot.symbol === lowerslot.symbol){
           return 0;
       }else{
           return upperslot.point+lowerslot.point;
       }
   }else{
       if(!upperslot.flipped && lowerslot.flipped){
           return lowerslot.point;
       }else if(upperslot.flipped && !lowerslot.flipped){
           return upperslot.point;
       }else{
           return 0;
       }
   }
}

function twoColumns(element1, element2, element3, element4){
    if(element1.flipped && element2.flipped && element3.flipped && element4.flipped){
        return ((element1.symbol === element2.symbol) && (element2.symbol === element3.symbol) && (element3.symbol === element4.symbol))? true: false;
    }else{
        return false;
    }
}

function allSame(element1, element2, element3, element4, element5, element6){
    if(element1.flipped && element2.flipped && element3.flipped && element4.flipped && element5.flipped && element6.flipped){
        return ((element1.symbol === element2.symbol) && (element2.symbol === element3.symbol) && (element3.symbol === element4.symbol) && (element4.symbol === element5.symbol) && (element5.symbol === element6.symbol))? true: false;
    }else{
        return false;
    }
}

function allFlipped(player){
    let hand = player.hand;
    for(let i = 0; i < hand.length; i++){
        if(!hand[i].flipped){
            return false;
        }
    }
    return true;
}

function allFlippedTotal(players){
    let count = 0;
    for(var key in players){
        if(players.hasOwnProperty(key)){
            if(allFlipped(players[key])){
                count++;
            }
        }
    }
    return count;
}

function getScore(hand){
    let col1 = compare(hand[0], hand[3]);
    let col2 = compare(hand[1], hand[4]);
    let col3 = compare(hand[2], hand[5]);
    
    if(allSame(hand[0], hand[3], hand[1], hand[4], hand[2], hand[5])){
        return -50;
    }
    if(twoColumns(hand[0], hand[3], hand[1], hand[4])){
        return col3-20;
    }
    if(twoColumns(hand[1], hand[4], hand[2], hand[5])){
        return col1-20;
    }

    return col1+col2+col3;
}

function getWinner(players, flag){
    let attr = 'score'
    if(flag === 'game'){
        attr = 'total'
    }
    var points = Object.values(players).map((data)=>{return data[attr]});
    var winners = [];
    const min = Math.min(...points);
    for(var key in players){
        if(players.hasOwnProperty(key)){
            if(players[key][attr] === min){
                winners.push(players[key]);
            }
        }
    }
    return winners;
}

function calculateTotal(players){
    for(var key in players){
        if(players.hasOwnProperty(key)){
           let total = players[key].total;
           total = total+players[key].score;
           players[key].total = total;
        }
    }
    return players;
}

function checkTotal(players, limit){
    for(var key in players){
        if(players.hasOwnProperty(key)){
           if(players[key].total >= limit){
               return true;
           }
        }
    }
    return false;
}

function newPlayer(uid, username, avatar, firstRound, canDraw, canSelect, hand, score, total, last_active){
    var player = {};

    player.uid = uid;
    player.username = username;
    player.avatar = avatar;
    player.firstRound = firstRound;
    player.canDraw = canDraw;
    player.canSelect = canSelect;
    player.hand = hand;
    player.score = score;
    player.total = total;
    player.last_active = last_active;

    return player;
}

exports.shufflePack = shufflePack;
exports.draw = draw;
exports.getScore = getScore;
exports.allFlipped = allFlipped;
exports.allFlippedTotal = allFlippedTotal;
exports.getWinner = getWinner;
exports.calculateTotal = calculateTotal;
exports.checkTotal = checkTotal;
exports.newPlayer = newPlayer;