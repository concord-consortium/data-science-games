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
    this.happyFollowingDistanceCarlengthsPer10 = 1;
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

    var tAccel = 0;

    //  first, see if we're going the speed we want
    if (this.speed < this.happySpeedMin) {
        tAccel = this.happyAccel;
    } else if (this.speed > this.happySpeedMax) {
        tAccel = this.happyBrake;
    }

    //  then deal with slowing down for a light
    var tHappyBrakeDistance = -(0.5) * this.speed * this.speed / this.happyBrake + 20; // minus because happyBrake is negative
    var tSameSpeedDistanceDuringYellow = trafficModel.lightSystem.lights[0].yellowDwell * this.speed;

    switch (situation.lightColor) {
        case "red":
            if (situation.lightDistance > 0 && situation.lightDistance <= tHappyBrakeDistance) {
                if (tAccel > this.happyBrake) tAccel = this.happyBrake;
            }
            break;
        case "yellow":
            if (situation.lightDistance > 0 && situation.lightDistance <= tHappyBrakeDistance) {
                if ((situation.lightDistance + 30) > tSameSpeedDistanceDuringYellow)
                    if (tAccel > this.happyBrake) tAccel = this.happyBrake;
            }
    }

    //  then worry about cars in front of us
    var tClosingSpeed = this.speed - this.sitch.nextCarSpeed;
    var tEffectiveNextCarDistance = this.sitch.nextCarDistance
        - this.sitch.nextCarLength
        - this.carLength * this.happyFollowingDistanceCarlengthsPer10 * this.speed/10
        - 5; // 5 = extra padding
    var tDistanceClosedAtHappyBrake
        = tClosingSpeed > 0
        ? tClosingSpeed * tClosingSpeed * 0.5 / (-this.happyBrake)
        : 0;

    if (tDistanceClosedAtHappyBrake > tEffectiveNextCarDistance) {
        if (tAccel > this.happyBrake) tAccel = this.happyBrake;
    }

    var tLogThing = "car @ " + Math.round(this.location)
        + " v " + Math.round(this.speed)
        + " a " + Math.round(this.acceleration);
    tLogThing += " dist="
        + Math.round(this.sitch.nextCarDistance)
        + " distClHB=" + Math.round(tDistanceClosedAtHappyBrake)
        + " eff=" + Math.round(tEffectiveNextCarDistance)
            + " clos=" + Math.round(tClosingSpeed)
    + " tAcc=" + Math.round(tAccel * 100)/100;

    var tPolicy = "maintain";
    if (tAccel < 0) tPolicy = "brake";
    if (tAccel > 0) tPolicy = "accelerate";
    var tDecision = {policy: tPolicy, value: tAccel};

   // console.log(tLogThing);     //  debug
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

    //var tAdornmentText =  Math.round(this.sitch.nextCarDistance).toString(); // tReason;   //
    var tAdornmentText =  Math.round(this.speed).toString(); // tReason;   //

    ctx.fillRect(tRear, tTop, 2, this.width);   //  todo: not really trear

    ctx.fillStyle = "white";
    ctx.font = "7px Monaco";
    ctx.fillText(tAdornmentText, tLeft, tTop - 1);


    ctx.restore();
};

