/**
 * Created by tim on 10/4/15.
 */

var gauge;

gauge = {
    min: 0,
    max: 0,
    value: 0,
    canvas: null,
    ctx: null,
    label: "Value",

    setup: function(theID, label, min, max) {
        this.canvas = document.getElementById(theID);
        this.ctx = this.canvas.getContext('2d');

        this.min = min;
        this.max = max;
        this.label = label;
    },

    update: function( val ) {

        this.value = val;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGauge();

    },

    drawGauge: function() {

        var tFrac = this.value / this.max;
        this.ctx.save();

        var tRGBString = "rgb(" + Math.floor(255.0 * tFrac) + ", " +
            Math.floor(255.0 * (1 - tFrac)) + ", 100)";

        this.ctx.fillStyle = tRGBString;

        this.ctx.fillRect(0,0,
            this.canvas.width * tFrac,
            this.canvas.height);

        //  text

        this.ctx.fillStyle = "#eeeeee";
        this.ctx.font = '14px Verdana';

        var tLabel = this.label + ": " + this.value;
        var tXText = (tFrac > 0.5) ? 6 : this.canvas.width * tFrac + 6;
        this.ctx.fillText(tLabel, tXText, this.canvas.height - 7);  //  half of font size, 14

        this.ctx.restore();
    }
}