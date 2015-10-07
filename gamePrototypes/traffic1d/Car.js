/**
 * Created by tim on 10/7/15.
 */

/**
 * A mostly model prototype that handles cars and their actions. Also covers drawing them.
 * @constructor
 */
var Car = function() {
    this.direction = "east";    //
    this.speed = 50;     //  pixels per second
    this.position = 400;  //  x-coordinate of center
    this.acceleration = 0;
    this.length = 10;
    this.width = 5;
    this.lane = 1;          //   measured fron the center. #1 is the fast lane.
    this.color = "#0000aa";
};

/**
 * Update the position and thinking of the Car
 * @param dt    how much time has elapsed
 */
Car.prototype.update = function(dt) {
    var tDirectionSign = (this.direction == "east") ? 1 : -1;
    this.position += tDirectionSign * this.speed * dt;
    this.position += tDirectionSign * 0.5 * this.acceleration * dt * dt;
    this.speed += tDirectionSign * this.acceleration * dt;

    // quick turn-around
    if (this.position > roadView.canvas.width) {
        this.position = roadView.canvas.width;
        this.direction = "west";
    } else if (this.position < 0) {
        this.position = 0;
        this.direction = "east";
    }
};

/**
 * Draw this car
 * @param ctx   The drawing context
 */
Car.prototype.draw = function(ctx) {
    var tX, tY;

    if (this.direction == "west") {
        tX = this.position - this.length / 2;
        tY = 50 - 10 * this.lane - this.width / 2;
    } else {
        tX = this.position - this.length / 2;
        tY = 50 + 10 * this.lane - this.width / 2;
    }
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(tX, tY, this.length, this.width);
    ctx.restore();
};

