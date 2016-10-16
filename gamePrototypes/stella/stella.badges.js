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

/*
How to implement a new badge!

1)  below, in stella.badges.badgeStatus, extend the JSON to include what the badge is.
2)  Make sure stella.badges.badgeIDbyResultType reflects the new badge
    (for which results will this badge give you auto privileges??

Bear in mind that badges often (always?) depend on "results," which are defined in StarResult.js.
For example, the result IDs (such as "pm_x") are there.

Note that they depend on scores in those results, which get awarded in StarResult.prototype.evaluateResult()
That in turn depends on stella.starResultTypes[<type>].errorL1, the (absolute) error that roughly corresponds
to level one of the associated badge.


 */

stella.badges = {

    checkNewResultForBadgeProgress: function (iResult) {
        for (var iBadge in this.badgeStatus) {
            if (this.badgeStatus.hasOwnProperty(iBadge)) {

                var tStat = this.badgeStatus[iBadge];

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
        }
    },

    badgeLevelForResult : function( iResultType ) {

        return this.badgeStatus[ this.badgeIDbyResultType[iResultType]].level;
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

    badgeIDbyResultType : {
        temp: "temp",
        vel_r: "vel_r",
        pos_x: "position",
        pos_y: "position",
        pm_x: "pm",
        pm_y: "pm",
        parallax: "parallax"
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
                    description: "low temperature (< 3500 K)",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "temp" && iResult.trueResultValue < 3500);
                    }
                },
                {
                    description: "medium temperature (3500 K <= T < 15000 K)",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "temp" && iResult.trueResultValue >= 3500 && iResult.trueResultValue < 15000);
                    }
                },
                {
                    description: "high temperature ( >= 15000 K)",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "temp" && iResult.trueResultValue >= 15000);
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
                    description: "radial velocity > 10",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "vel_r" && iResult.trueResultValue > 10);
                    }
                },
                {
                    description: "negative radial velocity",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "vel_r" && iResult.trueResultValue < 0);
                    }
                }

            ]
        },

        //  the position badge. Needs both x and y.

        position : {
            setAwardLevel: function( ) {
                var out = 0;
                if (stella.badges.lowestComponentPoints( this.badgeComponents) > 0) {
                    out = 1;
                }
                this.level = out;
            },
            level : 0,
            name : "Astrometry",
            scoreInBadge : 0,
            badgeComponents : [
                {
                    description: "x position successful",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "pos_x" && iResult.points > 0);
                    }
                },
                {
                    description: "y position successful",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "pos_y" && iResult.points > 0);
                    }
                }

            ]

        },

        //  the proper motion (pm) badge. Needs both x and y.

        pm : {
            setAwardLevel: function( ) {
                var out = 0;
                if (stella.badges.lowestComponentPoints( this.badgeComponents) > 0) {
                    out = 1;
                }
                this.level = out;
            },
            level : 0,
            name : "Proper Motion",
            scoreInBadge : 0,
            badgeComponents : [
                {
                    description: "proper motion in x successful",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "pm_x" && iResult.points > 0);
                    }
                },
                {
                    description: "proper motion in y successful",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "pm_y" && iResult.points > 0);
                    }
                }
            ]
        },

        //  the proper motion (pm) badge. Needs both x and y.

        parallax : {
            setAwardLevel: function( ) {
                var out = 0;
                if (stella.badges.lowestComponentPoints( this.badgeComponents) > 50) {
                    out = 1;
                }
                this.level = out;
            },
            level : 0,
            name : "Parallax",
            scoreInBadge : 0,
            badgeComponents : [
                {
                    description: "parallax greater than 20 microdegrees",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "parallax" && iResult.trueResultValue >= 20);
                    }
                },
                {
                    description: "parallax between 5 and 10 microdegrees",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "parallax" && iResult.trueResultValue >= 5
                        && iResult.trueResultValue <= 10);
                    }
                }
            ]
        }

    },


    toHTML : function() {
        var out = "<h2>Badge Progress</h2>";
        for (var iBadge in this.badgeStatus) {
            if (this.badgeStatus.hasOwnProperty(iBadge)) {
                var tStat = stella.badges.badgeStatus[iBadge];
                out += "<b>" + tStat.name + " </b>(" + tStat.scoreInBadge + " p total)</br>";
                out += (tStat.level > 0) ? "<b> LEVEL " + tStat.level + "</b><ul>" : "<ul>";

                tStat.badgeComponents.forEach(function (iBadgeComponent) {
                    out += "<li>" + "(" + iBadgeComponent.points + ") " + iBadgeComponent.description + "</li>";
                });
                out += "</ul>"
            }
        }
        return out;
    },

    toString: function () {

        var out = "\nNEW BADGE PROGRESS!\n";

        for (var iBadge in this.badgeStatus) {
            if (this.badgeStatus.hasOwnProperty(iBadge)) {
                var tStat = stella.badges.badgeStatus[iBadge];

                out += tStat.name + " (" + tStat.scoreInBadge + " p total)";
                out += (tStat.level > 0) ? " LEVEL " + tStat.level + "\n" : "\n";

                tStat.badgeComponents.forEach(function (iBadgeComponent) {
                    out += "    " + "(" + iBadgeComponent.points + ") " + iBadgeComponent.description + "\n";
                });
            }
        }
        return out;
    }
};