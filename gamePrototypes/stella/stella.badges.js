/**
 * Created by tim on 10/8/16.


 ==========================================================================
 stella.badges.js in gamePrototypes.

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


stella.badges = {

    checkNewResultForBadgeProgress: function (iResult) {
        for (iBadge in this.badgeStatus) {

            var tStat = this.badgeStatus[ iBadge ];

            tStat.badgeComponents.forEach(function (iBadgeComponent) {
                if (iBadgeComponent.fitsInComponent(iResult)) {
                    //  this result fits this component
                    if (iResult.points > iBadgeComponent.points) {
                        var dPoints = iResult.points - iBadgeComponent.points;
                        tStat.scoreInBadge += dPoints;
                        stella.player.stellaScore += dPoints;       //      update global score here
                        iBadgeComponent.points = iResult.points;
                        iBadgeComponent.relevantResult = iResult;

                        console.log(stella.badges.toString());
                    }
                }
            });

            tStat.setAwardLevel();

        }
    },

    badgeLevelFor : function( type ) {
        return this.badgeStatus[ type].level;
    },

    lowestComponentPoints : function( iComponents ) {
        var out = Number.MAX_VALUE;
        iComponents.forEach( function( iC ){
            if (iC.points < out) {
                out = iC.points;
            }
        });
        return out;
    },

    badgeStatus: {

        //  the Temperature badge

        temp: {
            setAwardLevel: function( ) {
                var out = 0;
                if (stella.badges.lowestComponentPoints( this.badgeComponents) > 10) {
                    out = 1;
                }
                this.level = out;
            },
            level: 0,
            name: "Temperature",
            scoreInBadge: 0,       //  total score for all results that have scored
            badgeComponents: [
                {
                    description: "low temperature (< 3000 K)",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "temp" && iResult.trueDisplayValue < 3000);
                    }
                },
                {
                    description: "medium temperature (3000 K <= T < 15000 K)",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "temp" && iResult.trueDisplayValue >= 3000 && iResult.trueDisplayValue < 15000);
                    }
                },
                {
                    description: "high temperature ( >= 15000 K)",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "temp" && iResult.trueDisplayValue >= 15000);
                    }
                }
            ]
        },

        vel_r: {
            setAwardLevel: function( ) {
                var out = 0;
                if (stella.badges.lowestComponentPoints( this.badgeComponents) > 10) {
                    out = 1;
                }
                this.level = out;
            },
            level : 0,
            name : "Radial Velocity",
            scoreInBadge : 0,
            badgeComponents : [
                {
                    description: "any radial velocity",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "vel_r");
                    }
                }

            ]
        }

    },


    toHTML : function() {
        var out = "<h2>Badge Progress</h2>";
        for (iBadge in this.badgeStatus) {
            var tStat = stella.badges.badgeStatus[iBadge];
            out += "<b>" + tStat.name + " </b>(" + tStat.scoreInBadge + " p total)</br>"
            out += (tStat.level > 0) ? "<b> LEVEL " + tStat.level + "</b><ul>" : "<ul>";

            tStat.badgeComponents.forEach(function (iBadgeComponent) {
                out += "<li>" + "(" + iBadgeComponent.points + ") " + iBadgeComponent.description + "</li>";
            })
            out += "</ul>"
        }
        return out;
    },

    toString: function () {

        var out = "\nNEW BADGE PROGRESS!\n";

        for (iBadge in this.badgeStatus) {
            var tStat = stella.badges.badgeStatus[iBadge];

            out += tStat.name + " (" + tStat.scoreInBadge + " p total)";
            out += (tStat.level > 0) ? " LEVEL " + tStat.level + "\n" : "\n";

            tStat.badgeComponents.forEach(function (iBadgeComponent) {
                out += "    " + "(" + iBadgeComponent.points + ") " + iBadgeComponent.description + "\n";
            })
        }
        return out;
    }
};