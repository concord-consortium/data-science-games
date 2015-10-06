var canvas;
var ctx;        //  the graphics context in our canvas.

var planex, planey, planeh, planev;
var destx, desty;
var previous = null;
var debugText = null;
var destExists = Boolean(false);

function setup( ) {
    debugText = document.getElementById('debug');
    //debugText.innerHTML = "Setup() called";
    
    canvas = document.getElementById('airspace');
    ctx = canvas.getContext('2d');
    canvas.addEventListener("mouseup",click,false);
    
    planex = 100;
    planey = 100;
    planeh = 0;
    planev = 5;    //  pixels per second
    window.requestAnimationFrame(update);
}

function update(timestamp) {
    if (!previous)  previous = timestamp;
    var dt = (timestamp - previous)/ 1000.0;
    previous = timestamp;
    
    debugText.innerHTML = Math.round(dt * 1000);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);    
    
    ctx.beginPath();
    updatePlanePos( dt );
    drawPlaneAt( planex, planey, planeh );
    if (destExists) {
        drawDestAt( destx, desty );
        if (checkArrival()) destExists = Boolean(false);
    }
    ctx.closePath();
    
    planeStatusText = document.getElementById('planeStatus');
    planeStatusText.innerHTML = planeStateString();
    
    window.requestAnimationFrame(update);
}

function checkArrival() {
    answer = Boolean(false);
    
    var dsq = (planex - destx) * (planex - destx) + (planey - desty) * (planey - desty);
    if (dsq < 25) answer = Boolean( true );
    
    return answer;
}

function drawDestAt( x, y) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,127,127,0.9)";
    ctx.translate( x, y);
    
    ctx.beginPath();
    ctx.moveTo(0,6);
    ctx.lineTo(-6,0);
    ctx.lineTo(0, -6);
    ctx.lineTo(6,0);
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
}

function    drawPlaneAt(x, y, heading) {
    ctx.save();
    
    ctx.fillStyle = "#99ff99";
    ctx.strokeStyle = "rgba(100,200,100,0.5)";
    ctx.font = "9px Courier New"

    ctx.translate( x, y);
    
    ctx.save();
    ctx.rotate( -heading );  // rotate negative because heading is clockwise :)
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.lineTo(-4, +4);
    ctx.lineTo(6, 0);
    ctx.closePath();
    
    ctx.fill( );
    
    ctx.beginPath();
    ctx.moveTo(8, 0); ctx.lineTo(40,0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    
    var textoff = (Math.sin(heading)> 0) ?  15 : -10;
    ctx.fillText(planeStateString(), -10, textoff);
    
    ctx.restore();
}

function    updatePlanePos( dt ) {
    planex += dt * planev * Math.cos(planeh);
    planey -= dt * planev * Math.sin(planeh);  // minus because of the way y works
}

function turn(degrees) {
    planeh -= 2 * Math.PI * degrees / 360.;
    planeh %= (Math.PI * 2);
}

function planeStateString( ) {
    var angle = Math.round(90 - planeh * 360 / Math.PI / 2);
    if (angle < 0) angle += 360;
    
    return "(" + Math.round(planex) + ", " + Math.round(planey) + ")"
    + " h = " + angle;
    
}

/*
Note: this routine gives page coordinates. We want the coordinates in the canvas.
*/
function click( e ) {
    console.log("click!");
    if (!e) var e = window.event;
    
    var x = 0;
    var y = 0;
    
    x = e.layerX;   //  gives coords of canvas?? Or whatever you clicked in?
    y = e.layerY;
    destx = x;
    desty = y;
    destExists = Boolean(true);
    
    console.log("(" + (x) + ", " + (y) + ")");
}