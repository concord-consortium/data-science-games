/**
 * Created by tim on 9/13/16.


 ==========================================================================
 Chemistry.js in gamePrototypes.

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


var Chemistry = {

    reactions : [],

    updateContents : function( iContents ) {
        if (Object.keys(iContents.precipitates).length > 0) {   //  there are solids; check for dissolution
            for (var tSolid in iContents.precipitates) {
                this.dissolve( tSolid, iContents );
            }
        }
    },

    dissolve : function( iSolidNameString, iContents ) {

        console.log("Dissolving " + iSolidNameString);

        var initialMolesOfSolid = iContents.precipitates[iSolidNameString];
        var theSolid = Chemistry.chemicals[ iSolidNameString ];

        var dissolutionReaction = Chemistry.reactionUsingOnly( iSolidNameString );  //  LHS has length 1

        if (dissolutionReaction) {  //  if there is a dissolution reaction for this solid...

            console.log( "Using reaction " + dissolutionReaction);
            var tReactantCoefficient = dissolutionReaction.reactants[0].coefficient;    //  coefficient of left hand side

            //  calculate the Ksp required if the entire amount were to dissolve

            var tRelevantContentsWouldBe = {};
            var KspRequiredForFullDissolve = 1;
            var tFluidVolume = (iContents.massH20 / 1000);   //  in liters, todo: disregarding expansion of H2O solution

            dissolutionReaction.products.forEach( function( prod ) {
                var tMoles = initialMolesOfSolid * prod.coefficient / tReactantCoefficient;
                tMoles += iContents.solutes[prod.species] || 0;         //  NB: evaluates to zero if the species is not present
                var tMolarity = (tMoles / tFluidVolume);  //  moles per liter.
                tRelevantContentsWouldBe[prod.species] = tMoles;
                KspRequiredForFullDissolve *= Math.pow(tMolarity, prod.coefficient);
            });

            if (dissolutionReaction.Ksp > KspRequiredForFullDissolve) {     //  it fully dissolves
                iContents.precipitates[iSolidNameString] = 0;
                dissolutionReaction.products.forEach(function (p) { //  loop over all the products, put the ions into the contents
                    iContents.addMolesOfSolute( initialMolesOfSolid * p.coefficient / tReactantCoefficient, p.species);
                });
            } else {        //  some precipitate is left


                //  construct an equilibrium expression using the first product species increase as x

                var tSpeciesExpressionArray = [];
                dissolutionReaction.products.forEach(function (p) { //  loop over all the products, put the ions into the contents
                    var tMolarityAlreadyThere = (iContents.solutes[p.species] / tFluidVolume) || 0;
                    var tThisSpeciesExpression = "(x + " + tMolarityAlreadyThere + ")";
                    for (var i = 0; i < p.coefficient; i++) {
                        tSpeciesExpressionArray.push(tThisSpeciesExpression);
                    }
                });
                var tExpression = tSpeciesExpressionArray.join("*");

                tExpression += " - " + dissolutionReaction.Ksp;

                //  solve the equation using Newton's method

                var newtonResult = TEEUtils.newtonsMethod( tExpression, 1,.0001 );  //  todo: should the initial value be the current concentration?

                if (newtonResult.success) {
                    console.log( "Newton solution of " + tExpression + " = 0 is " + newtonResult.x.toFixed(4) +
                        " (" + newtonResult.iterations + " iters)" );
                } else {
                    alert("Newton solution failed in dissolve()");
                }
                var tAdditionalMolarity = newtonResult.x;

                //  use the result (x) to decrease the amount of precipitate.
                //  How many moles will be used? tAdditionalMolarity * volume
                //  todo: deal with the case where the new amount of solute exceeds the amount available,
                //  todo: (continued) i.e., where the precipitate goes negative.

                iContents.precipitates[iSolidNameString] -= tAdditionalMolarity * tFluidVolume * tReactantCoefficient;

                //  use the result (x) to increase the amounts of solutes in the iContents

                dissolutionReaction.products.forEach(function (p) { //  loop over all the products, put the ions into the contents
                    iContents.addMolesOfSolute( tAdditionalMolarity * tFluidVolume * p.coefficient, p.species);
                });
            }
        }
    },


    reactionUsingOnly : function(iReactantString ) {
        var oReaction = null;
        Chemistry.reactions.forEach( function(r) {      //  todo: change to a reduce instead of forEach
            if (r.reactants[0].species === iReactantString && r.reactants.length === 1) {
                oReaction = r;
            }
        });
        return oReaction;
    },

    initialize : function() {
        var tReaction;

        tReaction = new Reaction(
            [
                { species : "NaCl", coefficient : 1}
            ],
            [
                {species : "Na+", coefficient : 1},
                {species : "Cl-", coefficient : 1}
            ]
        );
        tReaction.Ksp = 36;
        this.reactions.push( tReaction );

    },

    symbols : {
        equilibrium : "\u21cc",
        minus : "\u2013"
    }

};