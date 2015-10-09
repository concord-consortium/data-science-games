/**
 * Created by tim on 10/7/15.
 */

var tReason = "foo";
/**
 * A mostly model prototype that handles cars and their actions. Also covers drawing them.
 * @constructor
 */
var Car = function() {
    this.direction = "east";    //
    this.speed = 50;     //  pixels per second
    this.location = 100;  //  x-coordinate of front bumper
    this.acceleration = 0;
    this.carLength = 10;
    this.width = 5;
    this.lane = 1;          //   count from the center. #1 is the fast lane.
    this.color = "#0000aa";

    this.happySpeedMin = 33;   //  pixels per second
    this.happySpeedMax = 37;   //  pixels per second
    this.maxSpeed = 100;
    this.happyAccel = 10;   // pixels per second per second
    this.happyBrake = -10;
    this.maxBrake = -50;
    this.happyFollowingDistanceInSeconds = 1;
    this.decision = {policy: "maintain", value: 0}; //   or "accelerate" or "brake"

    this.sitch = null;  //  calculated out in the model

};

/**
 * Really this belongs in a separate class, about AIs.
 * @param situation
 * @returns {{policy: string, value: number}|*}
 */
Car.prototype.decide = function(situation) {
    this.sitch = situation;

    var tLogThing = "car @ " + Math.round(this.location)
        + " v " + Math.round(this.speed)
        + " a " + Math.round(this.acceleration);

    var tHappyBrakeTime = -this.speed / this.happyBrake;    //  negative sign because happyBrake is negative
    var tHappyBrakeDistance = -(.5) * this.happyBrake * tHappyBrakeTime * tHappyBrakeTime + 20;
    var tSameSpeedDistanceDuringYellow = trafficModel.lightSystem.lights[0].yellowDwell * this.speed;
    var tDecision;
    tDecision = {policy: "maintain", value: 0}; //default

    //  first, see if we're going the speed we want
    if (this.speed < this.happySpeedMin) {
        tDecision = {policy: "accelerate", value: this.happyAccel};
    } else if (this.speed > this.happySpeedMax) {
        tDecision = {policy: "brake", value: this.happyBrake};
    }

    //  then deal with slowing down for a light
    if (situation.lightColor != "green") {
        if (situation.lightDistance > 0 && situation.lightDistance < tHappyBrakeDistance) {
            tDecision = {policy: "brake", value: this.happyBrake};
            if (situation.lightColor == "yellow" && (situation.lightDistance + 30) < tSameSpeedDistanceDuringYellow) {
                tDecision = {policy: "maintain", value: 0};
            }
        }
    }

    //  then worry about cars in front of us
    var tClosingSpeed = this.speed - this.sitch.nextCarSpeed;
    var tEffectiveNextCarDistance = this.sitch.nextCarDistance
        - this.sitch.nextCarLength
        - this.happyFollowingDistanceInSeconds * this.sitch.nextCarSpeed;
    var tAccel = -tClosingSpeed * tClosingSpeed / 2.0 / tEffectiveNextCarDistance;

    tLogThing += " dist="
        + Math.round(this.sitch.nextCarDistance)
        + " eff=" + Math.round(tEffectiveNextCarDistance)
            + " clos=" + Math.round(tClosingSpeed)
    + " tAcc=" + Math.round(tAccel * 100)/100;

    tReason = (Math.round(tAccel * 100)/100).toString();    //  debug

    if (tAccel < this.happyBrake / 2) {
        tDecision = {policy: "brake", value: this.happyBrake};
    };
    // Kludge?
    if (tEffectiveNextCarDistance < 0) {
        tDecision = {policy: "brake", value: this.happyBrake};

    };

    console.log(tLogThing);     //  debug
    return tDecision;
};


/**
 * Update the location, etc  of the Car
 * @param dt    how much time has elapsed
 */
Car.prototype.update = function(dt) {
    var tDirectionSign = (this.direction == "east") ? 1 : -1;

    this.acceleration = this.decision.value;    //  here is where acceleration gets set

    this.location += tDirectionSign * this.speed * dt;
    this.location += tDirectionSign * 0.5 * this.acceleration * dt * dt;
    this.speed += this.acceleration * dt;
    if (this.speed < 0) {
        this.speed = 0;
        this.acceleration = 0;
    }

    if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;

/*
    console.log( "dir, pol, x,v,a = " + this.direction + " "
        + this.decision.policy + " "
        + Math.round(this.location) + " "
        + Math.round(this.speed) + " " + Math.round(this.acceleration)
        + " Lightdist: " + Math.round(this.sitch.lightDistance)
        + " happyBrakeDist: " + Math.round(this.sitch.lightDistance)
    );
*/
    // quick turn-around
    if (this.location > roadView.canvas.width) {
        this.location = roadView.canvas.width;
        this.direction = "west";
    } else if (this.location < 0) {
        this.location = 0;
        this.direction = "east";
    }
};

/**
 * Draw this car
 * @param ctx   The drawing context
 */
Car.prototype.draw = function(ctx) {
    var tLeft, tTop, tRear;

    if (this.direction == "west") {
        tLeft = this.location;
        tRear = tLeft + this.carLength;
        tTop = 50 - 10 * this.lane - this.width / 2;
    } else {
        tLeft = this.location - this.carLength;
        tRear = tLeft;
        tTop = 50 + 10 * this.lane - this.width / 2;
    }
    ctx.save();
    ctx.fillStyle = this.color;
    // ctx.fillStyle = this.sitch.lightColor;
    ctx.fillRect(tLeft, tTop, this.carLength, this.width);

    // brake lights

    switch (this.decision.policy) {
        case "brake":
            ctx.fillStyle = "red";
            break;
        case "accelerate":
            ctx.fillStyle = "green";
            break;
        case "maintain":
            ctx.fillStyle = "white";
            break;
        default:
            ctx.fillStyle = "yellow";
    }

    var tAdornmentText =  Math.round(this.sitch.nextCarDistance).toString(); // tReason;   //

    ctx.fillRect(tRear, tTop, 2, this.width);   //  todo: not really trear

    ctx.fillStyle = "white";
    ctx.font = "7px Monaco";
    ctx.fillText(tAdornmentText, tLeft, tTop - 1);


    ctx.restore();
};

