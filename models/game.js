const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.promise = Promise;

const gameSchema = new Schema({
	rid: {type: String, unique: true, required: true}, 
	name: String, 
    creator: Object, 
    date: { type: Date, default: Date.now },
    messages: Array,
    state: Object,
    settings: Object,
    type: String
});

let game = mongoose.model('Game', gameSchema);

module.exports = game;