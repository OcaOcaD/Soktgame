const express = require('express');
//Server stuff
var app = express();
//Socket.io
var socket = require('socket.io');
//Mongo Atlas
const mongoose = require('mongoose');
//Body Parser
const bodyParser = require('body-parser');
//ENV
require('dotenv/config');
// shit
const Score = require('./models/Score')
//SetuUp DB
mongoose.connect(
    // process.env.DB_CONNECTION,
    // process.env.MONGODB_URI || "mongodb://oca_oca:password_123@ds015403.mlab.com:15403/heroku_xq6tcx4n",
    // process.env.MONGODB_URI,
    process.env.MONGODB_URI || process.env.DB_CONNECTION,
    {   
        useUnifiedTopology: true,
        useNewUrlParser: true }, 
    () => console.log("Connected to DB!")
);
//Use Body Parser for requests
app.use(bodyParser.json());
//MAIN ROUTE
app.use( express.static('public') );
//Import scorecboard
const scoreRoute = require('./routes/scoreboard');
//MIDDLEWARE(S)     
app.use('/scoreboard', scoreRoute)
    
//Listinig port
var server = app.listen( process.env.PORT || 3000);
// var server = app.listen(3000);
console.log("SERVING MY FIRST GAME");
var io = socket(server);


/*
*
*
* SOCKET.IO EVENTS 
*
*
*
**/
//Client counting
var clientCount = 0;
//Rooms available
var rooms = [];
//New connection to the server
io.on('connection', function(socket){
    clientCount++;
    console.log("Número de clientes..." + clientCount);
    //Create a Room if needed or alert if alredy does
    socket.on('createRoom', (room) => {
        // console.log("attempting to join in room " + room.name)
        // console.log(room);
        let r;
        //Enter the selected room if not full
        if ( r = roomExists( room.name ) ){
            //Room exists, can't create 
            io.to(socket.id).emit('usedName', 'This room alredy exists.');
        }else{
            console.log("Creando sala...");
            socket.join( r.name );
            let playerTemplate = {
                id: socket.id,
                name: '',
                character: '',
                color: {r:138,g:179,b:41},
                lcolor: {r:234,g:255,b:184},
                dcolor: {r:43,g:61,b:1},
                onRoom: room.name
            }
            let newRoom = {
                name    : room.name,
                pass    : room.pass,
                players : [playerTemplate],
                size    : 1
            }
            rooms.push( newRoom );
            // Ok, socket joined the room. Change its view to the game.
            io.to(socket.id).emit('roomJoined', playerTemplate);
            // Broadcast a new player has joined
            r = roomExists( newRoom.name )
            io.to(r.name).emit('joined', 'Player ' + socket.id + ' has joined the Room.' );
            // console.log( r );
        }
    })
    //Create a Room if needed or alert if alredy does
    socket.on('joinRoom', (room) => {
        let r;
        //Enter the selected room if not full
        if ( r = roomExists( room.name ) ){
            console.log("Si existe...");
            //Room exists, check if it is full
            if ( fullRoom( r ) == false ){
                socket.join( r.name );
                console.log("Joining room...");
                let playerTemplate = {
                    id: socket.id,
                    name: '',
                    character: '',
                    color: {r:18,g:245,b:254},
                    lcolor: {r:181,g:252,b:255},
                    dcolor: {r:0,g:79,b:83},
                    onRoom: r.name
                }
                r.players.push( playerTemplate );
                r.size++;
                //Ok, socket joined the room. Change its view to the game.
                io.to(socket.id).emit('roomJoined', playerTemplate);
                //Broadcast a new player has joined
                io.to(r.name).emit('joined', 'Player ' + socket.id + ' has joined the Room.' );
                // console.log("Player " + socket.id + " joined room: " + r.players.onRoom );
                console.log("ENTONCES EN RESUMEN....")
                console.log(rooms);
            }else{
                console.log(" # # # Room "+ r.name +" alredy full # # #");
                io.to(socket.id).emit('fullRoom', 'This room is alredy full.');
            }
        }else{
            //Room doesn't exist
            io.to(socket.id).emit('roomDoesNotExist', 'This room doesn\'t exist.');
        }
    })
    //Character selected by a player alredy joined in a room.
    socket.on('selectFighter', ( playerInfo ) => {
        console.log(playerInfo);
        let r = playerInfo.onRoom;
        let i = playerInfo.id;
        let c = playerInfo.character;
        let n = playerInfo.name;
        var activeRoom;
        if ( activeRoom = roomExists( r ) ){
            for (let p of activeRoom.players) {
                //Search for the player who just selected character
                if ( p.id == i ){
                    //Player found
                    p.character = c;
                    p.name = n;
                    // io.to(socket.id).emit('waitScreen', 'Waiting for other players...');
                    io.to(socket.id).emit('playingTheGame', activeRoom);
                }
                // io.to(socket.id).emit('playingTheGame', activeRoom);
                // console.log( p );
            }
        }
    });

    socket.on('sendMissil', (missile) => {
        console.log("INCOMING SHOT "+ missile.projectile.n);
        let r;
        let enemy;
        r = roomExists( missile.room );
        console.log( missile );
        //Search for the id of the enemy
        for (let p of r.players) {
            if( p.id != missile.from ){
                enemy = p.id;
                console.log("TOWARDS: " + enemy );
            }
        }
        io.to(enemy).emit('valisteVerga', missile.projectile);
    });

    socket.on('gotHit', (missile) => {
        let r;
        let enemy;
        let winner;
        r = roomExists( missile.room );
        console.log( missile );
        //Search for the id of the enemy
        for (let p of r.players) {
            if( p.id != missile.from ){
                enemy     = p.id;
                winner = p.name;
                console.log("WINNER IS: " + winner );
            }
        }
        //Alarm the winner
        io.to(enemy).emit('winner', missile.projectile);
        //Add winner to scoreboard
        console.log("EL BUENO:");
        console.log(missile);
        console.log("Winner: "+winner)
        console.log("Shots: "+shots)
        addToScoreboard( winner, missile.projectile.n );
    });

    socket.on('disconnect', function(){
        console.log('User left the game');
        clientCount--;
    });
    
});
// Some useful functions
roomExists = ( r ) => {
    for (const room of rooms) {
        if ( room.name == r )
            return room;
    }
    return false;
}
fullRoom = ( room ) => {
    if ( room.size <= 2 ){
        return false;
    }else{
        return true;
    }
}

//Add teh winner data to the scoreboard module on DB
addToScoreboard = ( winner, shots ) => {
    const score = new Score({
        player: winner,
        shots: shots
    });
    
        score.save();
        console.log( "SAVED" )
    
}