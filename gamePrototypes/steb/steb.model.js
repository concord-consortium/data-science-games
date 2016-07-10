/**
 * Created by tim on 3/23/16.


 ==========================================================================
 steb.model.js in data-science-games.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 ==========================================================================


 */

/**
 * Singleton model object
 *
 * @type {{stebbers: Array, elapsed: null, meals: null, lastStebberNumber: null,
 * reproduce: steb.model.reproduce, findParent: steb.model.findParent,
 * update: steb.model.update, newGame: steb.model.newGame,
 * addNewStebberBasedOn: steb.model.addNewStebberBasedOn, removeStebber: steb.model.removeStebber,
 * frightenStebbersFrom: steb.model.frightenStebbersFrom, randomPlace: steb.model.randomPlace,
 * distanceBetween: steb.model.distanceBetween, randomColor: steb.model.randomColor,
 * mutateColor: steb.model.mutateColor,
 * predatorVisionColorVector: {red: number, green: number, blue: number},
 * predatorVisionBWFormula: string, getPredatorVisionColor: steb.model.getPredatorVisionColor,
 * convertToGrayUsingRGBFormula: steb.model.convertToGrayUsingRGBFormula
 * }}
 */

/* global steb, Stebber, Crud, TEEUtils, Snap */

steb.model = {

    stebbers : [],      //  array of Stebbers
    crud : [],          //  array of cruds. IN the CrudView file.
    elapsed : null,
    meals : null,       //  number of meals
    lastStebberNumber : null,
    meanCrudColor : null,
    trueBackgroundColor : null,

    /**
     * Perform reproduction in the Stebber set
     */
    reproduce : function()   {
        var tParent = null;
        var tChild = null;
        if (steb.options.delayReproduction) {
            if (this.meals % 5 === 0) {
                for (var i = 0; i < 5; i++) {
                    tParent  = this.findParent();
                    tChild = this.addNewStebberBasedOn( tParent );   //  adds the MODEL
                    steb.manager.addViewForChildStebber( tChild );
                }
            }
        } else {
            tParent = this.findParent();
            tChild = this.addNewStebberBasedOn( tParent );   //  adds the MODEL
            steb.manager.addViewForChildStebber( tChild );
        }
    },

    /**
     * Called from reproduce().
     * Find a suitable parent for a new Stebber.
     * @returns {*}     the parent, which is a Stebber
     */
    findParent : function() {
        var oParent = TEEUtils.pickRandomItemFrom( this.stebbers );
        if (steb.options.eldest) {
            var ix = TEEUtils.pickRandomItemFrom([0,0,0,1,1,2,3,4]);
            oParent = this.stebbers[ ix ];
        }
        return oParent;
    },

    /**
     * Update the state of the model, evolving it by idt seconds
     * @param idt   number of seconds to evolve
     */
    update : function ( idt ) {
        this.elapsed += idt;
        this.stebbers.forEach( function(iStebber) {
            iStebber.update(idt);
        });
        this.crud.forEach( function(iCrud) {
            iCrud.update(idt);
        });
    },


    /**
     * Set up the model for a new game
     */
    newGame : function() {

        steb.score.newGame();   //      initialize score object

        this.stebbers = [];     //      fresh array of Stebbers
        this.crud = [];     //      fresh array of Crud
        this.elapsed = 0;       //      elapsed time in seconds
        this.meals = 0;         //      number of meals
        this.lastStebberNumber = 0;

        var i;

        if (steb.options.fixedInitialBG) {
            this.trueBackgroundColor = steb.constants.defaultBackgroundColor;
            this.meanCrudColor = steb.constants.defaultCrudColor;
        } else {
            this.trueBackgroundColor = this.inventBackgroundColor();
            this.meanCrudColor = steb.options.backgroundCrud ?
                this.mutateColor(this.trueBackgroundColor, [-3, -3, -2, 2, 3, 3]) :
                null;
        }

        //  create a new set of Stebbers.
        if (steb.options.fixedInitialStebbers) {
            this.makeInitialFixedStebbers();
        } else {
            for (i = 0; i < steb.constants.initialNumberOfStebbers; i++) {
                this.addNewStebberBasedOn(null);
            }
        }

        //  create a new set of Crud.
        if (steb.options.backgroundCrud) {
            for (i = 0; i < steb.constants.numberOfCruds; i++) {
                this.crud.push(new Crud());
            }
        }
    },

    /**
     * Come up with a suitable color for the background.
     * @returns {*}
     */
    inventBackgroundColor : function() {
        var oColor = null;
        var tColor = "hsb(" + Math.random() + ", 0.5, 0.7)";
        var tRGB = Snap.getRGB(tColor);
        var tNorm = 15/255;

        oColor = [
            Math.round(tNorm * tRGB.r),
            Math.round(tNorm * tRGB.g),
            Math.round(tNorm * tRGB.b)
        ];

        oColor = this.randomColor( [6,7,8,9] );     //  temp restrict??

        return oColor;
    },

    /**
     * Add a new Stebber to the model.
     * Called from newGame() AND from reproduce()
     *
     * Note: if you pass in null (as this.newGame() does) this adds a Stebber with random properties.
     * Suitable for the beginning of the game.
     *
     * @param iParentStebber    the (optional) parent Stebber (therefore the one on which the new Stebber is based.)
     * @returns {Stebber}
     */
    addNewStebberBasedOn : function( iParentStebber ) {

        var tColor, tWhere = {};
        this.lastStebberNumber += 1;

        if (iParentStebber ) {
            var tMute = steb.options.reducedMutation ?
                steb.constants.stebberColorReducedMutationArray :
                steb.constants.stebberColorMutationArray;
            tColor = this.mutateColor( iParentStebber.color, tMute );
            tWhere.x = iParentStebber.where.x;
            tWhere.y = iParentStebber.where.y;
        } else {    //  beginning of the game, no parent
            tColor = this.randomColor( [1, 2, 3,4,5,6,7,8,9,10,11,12, 13, 14] );
            tWhere = this.randomPlace();
        }

        var tChildStebber = new Stebber( tColor, tWhere, this.lastStebberNumber );
        tChildStebber.setNewSpeedAndHeading();          //  it should immediately diverge from the parent
        this.stebbers.push( tChildStebber );            //  we keep the model Stebber in our array

        return tChildStebber;
    },

    makeInitialFixedStebbers : function() {
        var i, tColor = [], tWhere = {}, tNewStebber;

        for ( i = 0; i < steb.constants.initialNumberOfStebbers; i++) {
            this.lastStebberNumber += 1;
            tColor = steb.constants.fixedStebberColor[i];
            tWhere = this.randomPlace();
            tNewStebber = new Stebber( tColor, tWhere, this.lastStebberNumber );
            tNewStebber.setNewSpeedAndHeading();          //  it should immediately diverge from the parent
            this.stebbers.push( tNewStebber );            //  we keep the model Stebber in our array
        }
    },

    selectStebber : function( iSteb, iOnly ) {
        if (iOnly) {
            this.stebbers.forEach( function(iS) {
                iS.selected = false;
            });
        }
        iSteb.selected = true;
    },

    /**
     * Find the  Stebber in question and eliminate it.
     * @param iStebber  the Stebber to be axed
     */
    removeStebber : function( iStebber ) {
        this.meals += 1;
        var tKilledColor = steb.makeColorString( iStebber.color );  //  todo: use in future dataset
        var tIndex = this.stebbers.indexOf( iStebber );
        this.stebbers.splice( tIndex, 1 );
    },

    /**
     * Predation at the point, all Stebbers and Crud run away from it.
     * @param iPoint    the (local) point where predation occurred
     */
    frightenStebbersFrom : function( iPoint ) {
        this.stebbers.forEach( function(iStebber) {
            iStebber.runFrom( iPoint );
        });
        this.crud.forEach( function(iCrud) {
            iCrud.runFrom( iPoint );
        });
    },


    //      location utilities

    randomPlace : function() {
        return {
            x : Math.round(steb.constants.worldViewBoxSize * Math.random()),
            y : Math.round(steb.constants.worldViewBoxSize * Math.random())
        };
    },

    /**
     * Pythagorean distance between the two points. Each point is an object {x : ??, y : ??}
     * @param p1
     * @param p2
     * @returns {number}
     */
    distanceBetween : function( p1, p2 ) {
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var tDistance = Math.sqrt( dx * dx + dy * dy );

        return tDistance;
    },

    //          COLOR utilities

    /**
     * Choose a random color from the list, for each of the three colors in the array
     * @param iColors
     * @returns {Array}
     */
    randomColor : function( iColors ) {
        var oArray = [];

        for (var i = 0; i < 3; i++) {
            var tRan = TEEUtils.pickRandomItemFrom( iColors );
            oArray.push( tRan );
        }
        return oArray;
    },

    /**
     * Mutate the given color a bit, depending on the values in the given array
     * @param iColor    input color
     * @param iMutes    array of possible mutations
     * @returns {Array} output color, after mutation
     */
    mutateColor : function( iColor, iMutes )    {
        var oColor = [];

        iColor.forEach( function(c) {
            c += TEEUtils.pickRandomItemFrom( iMutes );
            c = steb.rangePin(c, 0, 15);
            oColor.push( c );
        });

        return oColor;
    },

    /**
     * Text debugging information about all the Stebbers.
     * @returns {string}
     */
    stebberColorReport: function () {
        var tout = "bg: " + JSON.stringify(steb.model.trueBackgroundColor) +
            " crud: " + JSON.stringify(steb.model.meanCrudColor) + "<br>";

        this.stebbers.forEach(function (s) {
                var tDBG = s.colorDistanceToBackground;
                var tDCrud = s.colorDistanceToCrud;

                tout += s.id + " " + JSON.stringify(s.color) + " dBG: " + tDBG.toFixed(2);
                if (tDCrud) {
                    if (typeof tDCrud !== 'undefined' && tDCrud !== null) {
                        tout += " dCrud: " + tDCrud.toFixed(2);
                    }
                    tout += " p = " + steb.predator.targetProbability(s).toFixed(3) + "<br>";

                }
            }
        );
        return tout;
    },


    //      Predator Vision Section

    /**
     * Initial values for the predator vision parameters.
     */
    predatorVisionColorVector : [1, 0, 0],          //  for the "dot product" scheme. [r, g, b] This is all red.
    predatorVisionBWCoefficientVector : [1, 1, 1],  //  for the "coefficient" scheme. [r, g, b]. This is straight gray from all three color channels.
    predatorVisionDenominator : 1,                  //  this gets calculated when needed, but 1 is a good default placeholder.

    /**
     * Find the color of an object as seen by the predator.
     * Determines which scheme we're using and applies it.
     *
     * @param iColor    actual color of the object
     * @returns {*}     apparent color of the object
     */
    getPredatorVisionColor: function (iColor) {

        var tResult = iColor;

        if (steb.options.useVisionParameters) {
            if (steb.options.predatorVisionType === "dotProduct") {
                var tDotProduct = this.predatorVisionColorVector;
                tResult = [
                    (iColor[0]) * tDotProduct[0],
                    (iColor[1]) * tDotProduct[1],
                    (iColor[2]) * tDotProduct[2]
                ];
                this.predatorVisionDenominator = tDotProduct[0] + tDotProduct[1] + tDotProduct[2];
            }
            else        //  using the BW vector coefficients
            {
                tResult = steb.model.convertToGrayUsingRGBFormula(iColor);
            }
        }

        //  pin the results into [0, 15]

        tResult.forEach( function(c, i) {   tResult[i] = steb.rangePin( c, 0, 15); });

        return tResult;
    },

    /**
     * Apply the coefficients to the input color to get the (grayscale) color that the predator sees
     * Called by this.getPredatorVisionColor
     *
     * The algorithm: Add up the absolute values of the coeffs to get a denominator. (tDenom)
     * At the same time, multiply the coefficient by either...
     * ...the color value, if the coefficent is positive, or
     * ...(the color value - 15) if it's negative. This will give a positive number in (coeff is < 0)
     * Add those up, and divide the total by tDenom, resulting in a number between 0 and 15.
     *
     * @param iColor        input color
     * @returns {Array}     the seen color
     */
    convertToGrayUsingRGBFormula : function(iColor ) {

        var tGrayscaleNumber = 0;
        var tDenom = 0;

        this.predatorVisionBWCoefficientVector.forEach( function(c, i ) {
            tDenom += Math.abs( c );
            tGrayscaleNumber += (c > 0) ? c * iColor[i] : (iColor[i] - 15) * c;
            });
        tGrayscaleNumber = (tDenom === 0) ? 0 : tGrayscaleNumber / tDenom;
        this.predatorVisionDenominator = tDenom;

        //  The result is gray. Not necessary to do it this particular way.
        //  Do anything plausible with the tGrayscaleNumber result.

        var tResult = [
            tGrayscaleNumber,
            tGrayscaleNumber,
            tGrayscaleNumber
        ];

        return tResult;
    },

    /**
     * the color distance. For now, it's just Euclidean in straight RGB color space.
     * No luminance adjustments or anything like that.
     * @param iColor1
     * @param iColor2
     * @returns {number}
     */
    colorDistance : function( iColor1, iColor2 ) {
        var tD2 = (iColor1[0] - iColor2[0]) * (iColor1[0] - iColor2[0]) +
            (iColor1[1] - iColor2[1]) * (iColor1[1] - iColor2[1]) +
            (iColor1[2] - iColor2[2]) * (iColor1[2] - iColor2[2]);
        return Math.sqrt( tD2 );
    }

};