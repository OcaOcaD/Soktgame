const express = require('express');
const router = express.Router();
const Score = require('../models/Score')

//
router.get('/', async (req, res) => {
    try {
        const scores = await Score.find();
        res.send( "Scores in db:" + scores);
        // res.send( scoreboard.html);
        // res.json(scores);
    } catch (err) {
        res.json({message: err})
    }
});

router.post('/', async ( req, res ) => {
    // console.log(req.body);
    const score = new Score({
        player: req.body.player,
        shots: req.body.shots
    });
    try{
        const savedScore = await score.save();
        res.json( savedScore );
    }catch(err){
        res.json({message: err})
    }
})
//
module.exports = router;