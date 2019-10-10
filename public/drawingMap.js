//Draw bases
drawBases = (l, c, d) => {
    //light, color, dark
    strokeWeight(2)
    stroke( l );    //light color stroke
    fill( l );      //light color fill
    circle( w/2, h/2, (h/8)*2 )
    noFill()
    circle( w/2, h/2, (h/6)*2 )
    stroke( c );    //normal color stroke
    circle( w/2, h/2, (h/4)*2 )
    stroke( d );    //dark color stroke
    circle( w/2, h/2, (h/3)*2 )
    //House rectangle    
    noStroke()
    fill( d );    //dark color fill
    rect( (w/2)-40, (h/2)-20, 80, 60, 0, 0, 5, 5 );
    //House triangle
    triangle( (w/2), (h/2)-50, (w/2-40), (h/2)-20, (w/2)+40, (h/2)-20 );
    //Cross lines
    fill( l );    //normal color fill
    rect( (w/2)-20, (h/2), 40, 10, 5 )
    rect( (w/2)-5, (h/2)-15, 10, 40, 5 )
    strokeWeight(1)
}
//
getRandomWall = () => ( Math.random() <= 0.16 ) ? true : false 
//
setBlocks = async ( width, height ) => {
    try {
        return await willSetBlocks( width, height )
        // console.log("AWAITED WALLS", walls)
    } catch (error) {
        console.log(error)
    }
}
//
willSetBlocks = ( width, height ) => {
    return new Promise( (resolve, reject) => {
        let walls = []
        let size = 50
        for (let y = 0; y < height; y += size ) {
            for (let x = 0; x < width; x+= size ) {
                if( getRandomWall() && x != width - 25 && y != height -25 ){
                    console.log("WALL AT",x, y)
                    walls.push( new Block( x, y, size ) )    
                }
            }
        }
        console.log("RESOLVED BLOCKS", walls)
        resolve( walls )
    } )
}
//
drawBlocks = async ( blocks ) => {
    try {
        await willDrawBlocks( blocks )
    } catch (error) {
        console.log("Error is here", error)  
    }
    
}
//
willDrawBlocks = ( blocks ) => {
    return new Promise( (resolve, reject) => {
        for (const b of blocks) {
            stroke( 0, 0, 0 )
            fill( playerInfo.dcolor.r, playerInfo.dcolor.g, playerInfo.dcolor.b )   
            rect( b.x, b.y, b.size, b.size )
        }
        resolve("BLOCKS DRAWN")
    } )
}