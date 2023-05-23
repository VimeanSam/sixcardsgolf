const Game = require('../../../models/game.js');

module.exports.listRooms = async (req, res) => {
    try{
        let games = await Game.find({});
        //console.log(games);
        res.status(200).json(games);
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}