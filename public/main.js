var socket = io.connect( process.env.PORT || 'http://localhost:3000');
console.log("I SAY SOMETHING");
let roomName;
let roomPass;
let charName;
let playerInfo = {};

socket.on( 'roomJoined', (playerTemplate) => {
    playerInfo = playerTemplate
    $(".screen").load( "characters.html" );
})

socket.on('usedName', (msg) => {} );
socket.on('joined', (msg) => { window.alert(msg) } );
socket.on('fullRoom', (msg) => { window.alert(msg) } );
socket.on('roomDoesNotExist', (msg) => { window.alert(msg) } );



createRoom = () => {
    //Create a new room and go into it...
    roomName = $(".crn").val();
    roomPass = $(".crp").val();
    room = {
        name: roomName,
        pass: roomPass
    }
    console.log("Enviando información");
    socket.emit('createRoom', room);
}
joinRoom = () => {
    //Create a new room and go into it...
    roomName = $(".jrn").val();
    roomPass = $(".jrp").val();
    room = {
        name: roomName,
        pass: roomPass
    }
    console.log("Enviando información");
    socket.emit('joinRoom', room);
}
handleRoomSelection = ( element ) => {
    console.log("Tratando de entrar a una sala");
    roomName = element.id;
    $(".screen").load( "characters.html" );
    
}
handleCharacterSelection = ( element ) => {
    charName = element.id;
    playerInfo.character = charName;
    console.log("Character selected");
    socket.emit('selectFighter', playerInfo);
    // setup();
}
