const Game = require('../../../models/game.js');

module.exports.listRooms = async (req, res) => {
    try{
        // let stale = await Game.aggregate([
        //     {$match: {date: {$gte: new Date((new Date().getTime() - (2 * 24 * 60 * 60 * 1000)))}, state: {gameover: true}}},
        //     { $addFields: {
        //         count: {
        //             $size: {
        //             $objectToArray: "$state.players"
        //             }
        //         }
        //     }}
        // ])
        // console.log("STALE", stale)
        let games = await Game.find({}).sort({ date: -1 })
        //console.log(games);
        res.status(200).json(games);
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}