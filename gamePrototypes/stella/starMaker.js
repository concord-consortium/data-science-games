/**
 * Created by tim on 10/10/16.


 ==========================================================================
 starMaker.js in gamePrototypes.

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

var stella = {};

starMaker = {

    stars: [],
    universeWidth: 5,              //  degrees, about 0.1 radians
    universeDistance: 100,          //  parsecs
    maxStarLogMass: 1.5,           //  30 solar masses
    minStarLogMass: -1.0,          //  0.1 solar masses
    secPerYear: 86400 * 365.24,    //  seconds
    astronomicalUnit: 1.5e13,  //  centimeters
    debugText : "",

    update : function() {

        var s;      //  temp string

        s = "star list";

        $("#starList").html( this.debugText );
    },

    newStarsButtonPressed: function () {
        this.stars = [];
        this.parsec = 206265 * this.astronomicalUnit; //  must be computed

        this.debugText = (this.oldMakeAllStars());
        this.update();
    },

    oldMakeAllStars : function() {

        var tRegularStars = 200;
        var tClusterStars = 100;

        var i, tFrustum, tMotion, tS;

        //  first, miscellaneous stars of middling age

        tFrustum = {
            xMin : 0,
            yMin : 0,
            width : this.universeWidth,
            L1 : 0,
            L2 : this.universeDistance
        };

        //  motion parameter for pm and V_rad. Means and SDs.
        tMotion = {
            x : 0,  sx : 25,
            y : 0,  sy : 25,
            r : 5,  sr : 25
        };

        for (i = 0; i < tRegularStars; i++) {
            tS = new Star( tFrustum, tMotion, 9.0 + 0.5 * Math.random() );
            this.stars.push( tS );
            //  console.log( tS.toString() );
        }

        //  then, stars in a cluster


        tMotion = {             //  motion of the cluster
            x : 20,  sx : 5,
            y : 40,  sy : 5,
            r : 25,  sr : 5
        };

        var tClusterStarXCBaseFrac = 0.3 + 0.4 * Math.random(); //  center of the cluster
        var tClusterStarYCBaseFrac = 0.3 + 0.4 * Math.random();
        var tClusterHalfWidthFrac = 0.1;        //  width of the star position frustum, sort of

        for ( i = 0; i < tClusterStars; i++) {
            var tClusterStarXMIN = TEEUtils.randomNormal(tClusterStarXCBaseFrac, tClusterHalfWidthFrac);
            var tClusterStarYMIN = TEEUtils.randomNormal(tClusterStarYCBaseFrac, tClusterHalfWidthFrac);
            tFrustum = {
                xMin : tClusterStarXMIN * starMaker.universeWidth,   //  0.2 * stella.constants.universeWidth,
                yMin : tClusterStarYMIN * starMaker.universeWidth,   //  0.4 * stella.constants.universeWidth,
                width : tClusterHalfWidthFrac * starMaker.universeWidth,
                L1 : starMaker.universeDistance,
                L2 : starMaker.universeDistance + 5
            };

            tS = new Star( tFrustum, tMotion, 7.0 + 0.1 * Math.random() );
            this.stars.push( tS );
        }

        //  Sort the stars by apparent magnitude

        this.stars.sort( function(a,b) {
            return a.mApp - b.mApp;
        });

        //  Now give them ids (text, NOT caseIDs) for the catalog.

        for (var s = 0; s < this.stars.length; s++) {
            var tNumber = 1000 + s;
            this.stars[s].id = "S" + tNumber;
            //  this.stars[s].spectrum.source.id = this.stars[s].id;
        }

        var jsonArray = [];

        this.stars.forEach(
            function( s ) {
                jsonArray.push(s.jsonRepresentation());
            }
        );

        return jsonArray.join(",");
    }


};

stella.pmFromSpeedAndDistance = function (iSpeed, iDistance) {
    var oPM = 0;

    var tRadialDistanceInCM = iDistance * starMaker.parsec;
    var tTransverseSpeedInCMperSEC = iSpeed * 1.0e05;
    var tTransverseDistancePerYear = tTransverseSpeedInCMperSEC * starMaker.secPerYear;  //  in CM

    oPM = (180 / Math.PI) * (tTransverseDistancePerYear / tRadialDistanceInCM );

    return oPM;
};

var Star = function( iFrustum, iMotion, iLogAge ) {
    this.caseID = -1;

    var t1 = Math.random();
    var t2 = (1 - t1) * (1 - t1);
    this.logMass = (starMaker.maxStarLogMass - starMaker.minStarLogMass) * t2 - 1;
    this.logMainSequenceRadius = (2/3) * this.logMass;
    this.logRadius = this.logMainSequenceRadius;
    this.logLuminosity = 3.5 * this.logMass;
    this.logMainSequenceTemperature = 3.76 + 13/24 * this.logMass;  //  3.76 = log10(5800), the nominal solar temperature
    this.logTemperature = this.logMainSequenceTemperature;      //  start on main sequence
    this.logLifetime = 10 + this.logMass - this.logLuminosity;
    this.logAge = null;
    this.myGiantIndex = 0;

    this.vx = TEEUtils.randomNormal( iMotion.x, iMotion.sx);
    this.vy = TEEUtils.randomNormal( iMotion.y, iMotion.sy);
    this.vr = TEEUtils.randomNormal( iMotion.r, iMotion.sr);

    var tDistanceCubed = Math.pow(iFrustum.L1,3) +  Math.random() * (Math.pow(iFrustum.L2,3) - Math.pow(iFrustum.L1,3));

    this.where = {
        x : iFrustum.xMin + Math.random() * iFrustum.width,
        y : iFrustum.yMin + Math.random() * iFrustum.width,
        z : Math.pow(tDistanceCubed, 0.333)
    };

    this.pm = {
        x : stella.pmFromSpeedAndDistance( this.vx, this.where.z),
        y : stella.pmFromSpeedAndDistance( this.vy, this.where.z),
        r : this.vr
    };

    this.id = 42;       //  placeholder. Gets set elsewhere.
    this.logAge = iLogAge;

    //  this.evolve( );     //  old enough to move off the MS?
    //  this.spectrum = this.setUpSpectrum();
    //  this.doPhotometry();    //  calculate UBV (etc) magnitudes
};

Star.prototype.jsonRepresentation = function( ) {
    var j = {};
    j.id = this.id;
    j.logMass = this.logMass;
    j.logAge = this.logAge;
    j.x = this.where.x;
    j.y = this.where.y;
    j.z = this.where.z;
    j.vx = this.vx;
    j.vy = this.vy;
    j.vz = this.vr;

    return JSON.stringify(j);
};

//{
//    "idSEQ": "341",
//    "id": "S1040",
//    "logMass": "0.287062",
//    "logAge": "9.49248",
//    "x": "2.95153",
//    "y": "3.57755",
//    "z": "71.1582",
//    "vx": "-3.58849",
//    "vy": "7.70158",
//    "vz": "-16.9178"
//}


Star.prototype.csvLine = function( ) {
    var o = "";
    o = this.id + "," + this.logMass + "," + this.logAge + "," +
        this.where.x + "," + this.where.y + "," + this.where.z + "," +
        this.vx + "," + this.vy + "," + this.vr;

    return o;
};
