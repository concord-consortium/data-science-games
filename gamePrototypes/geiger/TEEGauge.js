/**
 * Created by tim on 10/4/15.
 */

var gauge;

gauge = {
    min: 0,
    max: 0,
    value: 0,
    wholeSVG: null,
    backgroundRect: null,
    gaugeRect: null,
    gaugeText: null,

    label: "Value",

    setup: function(theID, label, min, max) {
        this.wholeSVG = document.getElementById(theID);

        this.min = min;
        this.max = max;
        this.label = label;

        this.backgroundRect = document.createElementNS(svgNS, "rect");
        this.gaugeRect = document.createElementNS(svgNS, "rect");
        this.gaugeRect.setAttribute("width", this.wholeSVG.getAttribute("width"));
        this.gaugeRect.setAttribute("height", this.wholeSVG.getAttribute("height"));
        this.gaugeRect.setAttribute("x", "0");
        this.gaugeRect.setAttribute("y", "0");
        this.gaugeRect.setAttribute("y", "0");
        this.gaugeRect.setAttribute("fill", "#777777");
        this.backgroundRect.setAttribute("width", this.wholeSVG.getAttribute("width"));
        this.backgroundRect.setAttribute("height", this.wholeSVG.getAttribute("height"));
        this.backgroundRect.setAttribute("x", "0");
        this.backgroundRect.setAttribute("y", "0");
        this.gaugeRect.setAttribute("fill", "darkblue");

        this.wholeSVG.appendChild(this.backgroundRect);
        this.wholeSVG.appendChild(this.gaugeRect);

        this.gaugeText = document.createElementNS(svgNS, "text");
        this.gaugeText.textContent = "foo";
        this.gaugeText.setAttribute("y", "20");
        this.gaugeText.setAttribute("x", "4");
        this.gaugeText.setAttribute("fill", "white");
        this.gaugeText.setAttribute("font-family", "Verdana");

        this.wholeSVG.appendChild(this.gaugeText);


    },

    update: function( val ) {

        this.value = val;

        this.drawGauge();

    },

    drawGauge: function() {

        var tFrac = this.value / this.max;
        if (tFrac > 1) tFrac = 1;

        var tRGBColorString = "rgb(" + Math.floor(255.0 * tFrac) + ", " +
            Math.floor(255.0 * (1 - tFrac)) + ", 100)";

        this.gaugeRect.setAttribute("fill", tRGBColorString);

        tWidthNumber = Number(this.wholeSVG.getAttribute("width")) * tFrac;

        this.gaugeRect.setAttribute("width", tWidthNumber.toString());

        var tLabel = this.label + ": " + this.value;
        this.gaugeText.textContent = tLabel;

        var tXofTheText = 6;
        if (tFrac < 0.5) {
            tXofTheText = tWidthNumber + 6;
            this.gaugeText.setAttribute("text-anchor","start");
        } else {
            tXofTheText = tWidthNumber - 6;
            this.gaugeText.setAttribute("text-anchor","end");
        }
        this.gaugeText.setAttribute("x", tXofTheText.toString());

    }
}