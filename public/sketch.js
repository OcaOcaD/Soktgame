// START THE GAME!
let fr = 30;
let w =  1024;
let h =  720;
w = 1440;
h = 810
let frontier = [];
let playerTeam;
let enemy
let currentRoom;    //This object gonnac ontain the room info (players, name)
let projectiles = [];
let missiles = [];
let shots = 0;


let normalWeapon = {
    width: 10,
    height: 10,
    team: "green"
}
let start = {
    x: w/2,
    y: h/2
}
let position = {
    x: '', 
    y: ''
}
for (let f = 0; f < w; f++) {
    let coord = {
        x: f,
        y: 10
    }
    frontier.push( coord );
}
let character;      //Figure of the player
let pr; //R
let pg; //G
let pb; //B
setStartingChar = () => {
    if ( character == "squeert" ){
        console.log("drawing a rect");
        rect( start.x, start.y, start.x+50, start.y+50 );
    }
    if ( character == "zyrk" ){
        console.log("drawing a circle");
        circle( start.x+25, start.y+25, 50 );
    }
    if ( character == "tryan" ){
        console.log("drawing a triangle");
        triangle(start.x, start.y, start.x-25, start.y+50, start.x+25, start.y+50);
    }
    position.x = start.x,
    position.y = start.y
}
preload = () => {
    noLoop();
    socket.on('playingTheGame', (room) => { 
        console.log("hola");
        currentRoom = room;
        $(".screen").hide();
        $(".main").css({"height": "auto"})
        $(".p5Canvas").show();
        pr = playerInfo.color.r;
        pg = playerInfo.color.g;
        pb = playerInfo.color.b;
        //get the enemy socket it
        console.log("I AM: " + playerInfo.id );
        console.log(room);
        let cont = 0;
        for (let p of currentRoom.players) {
            console.log(cont);
            if( p.id != playerInfo.id ){
                enemy = p.id;
                console.log("MY ENEMY IS: " + enemy );
            }
            cont++;
        }
        //The team now
        playerTeam = "green";       //////////////////////////////////////
        $(".p5Canvas").css({"border": "2px solid rgb("+pr+", "+pg+", "+pb+")"}) 
        setup();
        setTimeout(function(){ loop(); }, 1500);       
     } );
}
setup = () => {
    socket.on('valisteVerga', ( missile ) => {
        console.log("RECIBI ALGO");
        console.log( missile );
        missile.y = 0;
        missiles.push( missile )
    })
    socket.on('winner', ( missile ) => {
        window.alert("GANASTE CON " + missile.n + " PROYECTIL(ES)");
        console.log( missile );
        //scoreBoard(userName, missile.n);
    })
    console.log("SETUP????");
    frameRate( fr );
    //Create character
    noStroke();
    fill(  pr, pg, pb );    //Player color
    character = playerInfo.character;
    console.log("character => " + character);
    setStartingChar();  //Create char and start position
    createCanvas(w,h);  //Create "map"
        //Retrieve room info and use it
    
}
//
draw = () =>{    
    background( 29, 29, 27 );
    noStroke();
    fill(  pr, pg, pb );
    rect( 0, 0, w, 10 );    //Frontier
    drawBases(playerInfo.lcolor, playerInfo.color, playerInfo.dcolor);
    drawProjectiles();
    drawMissiles();
    if( missileHit() ){
        
        window.alert("PERDISTE");
        background( 255, 0, 0 );
        noLoop()
    }
    //Drawing the character
    fill( pr, pg, pb );
    stroke( playerInfo.dcolor.r, playerInfo.dcolor.g, playerInfo.dcolor.n );
    if ( character == "squeert" ){
        rect( position.x, position.y, 50, 50 );
    }
    if ( character == "zyrk" ){
        circle( position.x+25, position.y+25, 50 );
    }
    if ( character == "tryan" ){
        triangle(position.x, position.y, position.x-25, position.y+50, position.x+25, position.y+50);
    }
    //MOVEMENT
    if ( keyIsDown(65) ) {  // A
        position.x -= 5;
    }
    if ( keyIsDown(68) ) {  // D
        position.x += 5;
    }
    if ( keyIsDown(87) ) {  // W
        position.y -= 5;
    }
    if ( keyIsDown(83) ) {  // s
        position.y += 5;
    }
    moveProjectiles();
    moveMissiles();
}
//Draw bases
drawBases = (l, c, d) => {
    //light, color, dark
    strokeWeight(2);
    stroke( l.r, l.g, l.b );    //light color stroke
    fill( l.r, l.g, l.b );      //light color fill
    circle( w/2, h/2, (h/8)*2 );
    noFill();
    circle( w/2, h/2, (h/6)*2 );
    stroke( c.r, c.g, c.b );    //normal color stroke
    circle( w/2, h/2, (h/4)*2 );
    stroke( d.r, d.g, d.b );    //dark color stroke
    circle( w/2, h/2, (h/3)*2 );
    //House rectangle    
    noStroke();
    fill( d.r, d.g, d.b );    //dark color fill
    rect( (w/2)-40, (h/2)-20, 80, 60, 0, 0, 5, 5 );
    //House triangle
    triangle( (w/2), (h/2)-50, (w/2-40), (h/2)-20, (w/2)+40, (h/2)-20 );
    //Cross lines
    fill( l.r, l.g, l.b );    //normal color fill
    rect( (w/2)-20, (h/2), 40, 10, 5 );
    rect( (w/2)-5, (h/2)-15, 10, 40, 5 );
    strokeWeight(1);
}
function keyPressed() {
    if (keyCode === 70) {
        shots++;
        newProjectile( normalWeapon );
    }
}
newProjectile = ( weapon ) => {
    console.log("SHOOOOOOOTING");
    console.log( weapon );
    console.log( position );
    let nP = {
        w: weapon.width,
        h: weapon.height,
        x: position.x+20,
        y: position.y - weapon.height,
        team: playerTeam,
        speed: 10,
        n: shots
    }
    projectiles.push( nP )
    // rect( position.x + 20, position.y - weapon.y, weapon.width, weapon.height );
}
drawProjectiles = () => {
    for (const p of projectiles) {
        //Draw your projectiles in your color
        fill(  pr, pg, pb );
        if( p && p!= "empty" )
            rect( p.x, p.y, p.w, p.h );
    }
}
moveProjectiles = () => {
    num = 0;
    while( projectiles[num] && num < projectiles.length ){
        let p = projectiles[num];
        if( p && p!= "empty" ){
            console.log("movin projectile");
            console.log(p);
            p.y -= p.speed;
        }else{
            console.log("this is a null projectile");
            console.log(p);
        }
        //console.log(p.y + p.h)
        //Check if the projectile just touched the edge of the screen.
        if( (p.y + p.h) <= 10 ){
            console.log("ENVIADO");
            //Emit projectile to the other player
            let missile = {
                projectile: p,
                from: playerInfo.id,
                room: roomName
            }
            socket.emit('sendMissil', missile);
            console.log("borraré el numero" + num);
            projectiles[num] = null;
            let aux = projectiles.filter( (pInCheck) => pInCheck != null );
            projectiles = aux;
            // projectiles = projectiles.splice(num,1);
            console.log(projectiles)
            console.log(projectiles.length);
        }
        num++;
        console.log("I keep runnig cuz: " + num +" < " + projectiles.length );
    }
}
drawMissiles = () => {
    for (const m of missiles) {
        //Draw the incoming missiles in reddish
        fill( 255, 0, 105 );
        if( m && m != "empty" )
            rect( m.x, m.y, m.w, m.h );
    }
}
moveMissiles = () => {
    for (let m of missiles) {
        if( m && m != "empty" )
            m.y += m.speed;
    }
}
missileHit = () => {
    for (let m of missiles) {
        if( m && m != "empty" ){
            if( position.x <= m.x && m.x <= (position.x + 50) ){
                //X axis matches
                if( m.y >= position.y && m.y <= (position.y + 50) ){
                    //Y axis crashes too. Missile hit
                    let winnerHit = {
                        projectile: m,
                        from: playerInfo.id,
                        room: roomName
                    }
                    socket.emit('gotHit', winnerHit);
                    return true;
                }
            }
        }
    }
    return false;
}