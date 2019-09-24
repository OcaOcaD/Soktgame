const mongoose = require('mongoose');
//Create a schema => the way the data looks
const ScoreSchema = mongoose.Schema({
    player: {
        type: String,
        default: "userName"
    },
    shots: String
});
module.exports = mongoose.model('Score', ScoreSchema);