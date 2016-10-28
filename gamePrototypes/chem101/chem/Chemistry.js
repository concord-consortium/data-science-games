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

    Kw: 1.0e-14,
    clearColor : 'dodgerblue',

    reactions: [],

    updateContents: function (iContents) {

        if (iContents.massH2O > 0) {
            console.log("--- Chemistry --- START updating " + iContents.shortString());

            /*
             For each reaction, see if the LHS is a single solid present in the contents,
             i.e., that there is a solid in the Contents that could potentially dissolve.
             Then totally dissolve that solid, so that everything as aqueous.
             We'll (re) precipitate everything out later.

             Do the same for all swirlies, of course, since they're not technically aqueous.
             */
            var tReactionsUsed = [];
            var tOldSolids = {};
            for (var iSolid in iContents.solids) {
                tOldSolids[iSolid] = iContents.solids[ iSolid ];
            }

            this.reactions.forEach(function (rr) {
                //  check if the left hand side is alone, and if these reactants are present
                if (
                    iContents.solids.hasOwnProperty(rr.reactants[0].species) &&
                    rr.reactants.length === 1
                ) {
                    if (iContents.solids[rr.reactants[0].species] > 0) {
                        //  the solid is listed and there's more than zero of it....
                        tReactionsUsed.push(rr);
                        Chemistry.forceDissolve(rr, iContents);
                    }
                }

                //  swirlies...

                if (
                    iContents.swirlies.hasOwnProperty(rr.reactants[0].species) &&
                    rr.reactants.length === 1
                ) {
                    if (iContents.swirlies[rr.reactants[0].species] > 0) {
                        //  the solid is listed and there's more than zero of it....
                        tReactionsUsed.push(rr);
                        Chemistry.forceDissolve(rr, iContents);
                    }
                }
            });

            var tReactionListString = tReactionsUsed.reduce(function (prev, curr, ix) {
                return prev + " | " + curr.toString();
            }, "");
            console.log("Dissolve reactions used: " + tReactionListString);
            console.log("--- Chemistry --- >>everything is aqueous: " + iContents.shortString());

            //  Now go over any remaining reactions in which all "product" species are present
            //  in case they precipitate out

            //  first, get a list of the relevant reactions
            //  we get a list instead of simply processing in case we decide later
            //  that you need to address them in some order.

            var tPrecipitationReactions = [];

            this.reactions.forEach(function (rr) {
                //  check if all the products on the RHS are present. Assume they are solutes.

                var tRHSRelevant = rr.products.reduce(function (iPrev, iCurr) {
                    return iPrev && iContents.solutes.hasOwnProperty(iCurr.species) && iContents.solutes[iCurr.species] > 0;
                }, true);
                if (tRHSRelevant) {
                    tPrecipitationReactions.push(rr);
                }
            });


            tReactionListString = tPrecipitationReactions.reduce(function (prev, curr, ix) {
                return prev + " | " + curr.toString();
            }, "");
            console.log("Precipitation reactions: " + tReactionListString);
            tPrecipitationReactions.forEach(function (rr) {
                Chemistry.precipitate(rr, iContents);
            });

            //  now make those swirlies solid which were solid in the first place!

            /*
            2016-10-28
            Note: about the constant kFudge.

            TEE discovered that due to small errors in the Newton's method solutions, a first
            precipitation calculation would appear correct, but not take quite enough out of solution.
            Then the second such calculation would need to take a bit more.

            this made aSwirl > toSolidify, causing a small amount of precipitate (swirly)
            to be floating around in solution rather than being a solid.

            kFudge, therefore, attempts to remedy this, reasoning that if we're within 0.1% of
            accounting for ALL of a solid having been a solid before, we should pretend it's
            all solid and leave none as a swirling precipitate.

            Of course, its aqueous species are still in a saturated solution.
             */

            var kFudge = 1.001;

            for (ixSolid in tOldSolids) {
                if (iContents.swirlies.hasOwnProperty(ixSolid)) {
                    var aSwirl = iContents.swirlies[ixSolid];   //  moles of this swirly
                    var toSolidify = tOldSolids[ixSolid];       //  moles that were in old solids
                    if (toSolidify * kFudge > aSwirl) {         //  see note above
                        toSolidify = aSwirl;
                        aSwirl = 0;
                    } else {
                        aSwirl -= toSolidify;
                    }

                    iContents.swirlies[ixSolid] = aSwirl;
                    iContents.solids[ ixSolid ] = toSolidify;

                }
            }

            console.log("--- Chemistry ---  DONE with precipitation: " + iContents.shortString());

            //  finally, make sure the water dissociation is correct!

            this.dissociateWater(iContents);
        }
        console.log("--- Chemistry ---  DONE with water: " + iContents.shortString());
    },

    dissociateWater: function (iContents) {
        if (iContents.massH2O > 0) {
            console.log("Dissociating water:");

            var tHydroniumMolarity = iContents.molarityOfSolute("H3O+");
            var tHydroxylMolarity = iContents.molarityOfSolute("OH-");
            var tSolution;      //  amount to increase the molarity of H3O+

            if (tHydroniumMolarity === tHydroxylMolarity) {
                //  we can solve this exactly, and better!

                var tSolution = Math.sqrt(Chemistry.Kw) - tHydroniumMolarity;

            } else {
                var tDissociationExpression =
                    "(x + " +
                    tHydroniumMolarity + ") * (x + " +
                    tHydroxylMolarity + ") - " +
                    Chemistry.Kw;

                var newtonResult = TEEUtils.newtonsMethod(tDissociationExpression, 1.0e-07, 1.0e-16);
                if (newtonResult.success) {
                    console.log("    Dissociate: Newton solution changes [H3O+] from " + tHydroniumMolarity + " to " + (tHydroniumMolarity + newtonResult.x));
                } else {
                    alert("Newton solution failed in dissociateWater()");
                }
                tSolution = newtonResult.x;
            }

            iContents.solutes["H3O+"] += tSolution * iContents.fluidVolume();
            iContents.solutes["OH-"] += tSolution * iContents.fluidVolume();

            //  todo: we ignore change in neutral water volume. Should we?
        }
    },

    forceDissolve : function( iReaction, iContents) {
        var iSolidNameString = iReaction.reactants[0].species;
        var initialMolesOfSolid = iContents.solids[iSolidNameString] || 0;     //  0 if there is not yet any solid
        var tReactantCoefficient = iReaction.reactants[0].coefficient;    //  coefficient of left hand side

        iReaction.products.forEach(function (ixProduct) {

            //  how many moles of THIS product are in the solid?
            var tNewMolesOfThisProduct = initialMolesOfSolid * ixProduct.coefficient / tReactantCoefficient;
            iContents.addMolesOfSolute(ixProduct.species, tNewMolesOfThisProduct);  //  go ahead and add them in
        });

        iContents.solids[iSolidNameString] = 0;   //  we've dissolved everything, now we might bring some back...
    },

    precipitate: function (iReaction, iContents) {   //  iSolidNameString, iContents) {
        /*
            We begin calling this knowing that there are no solids present, only solutes.
            Of course, this gets called for each relevant reaction,
            so any precipitates might make solids present.
            As we take stuff out of solution, concentrations will only go down.

         */
        console.log("    precipitating using " + iReaction);

        var iSolidNameString = iReaction.reactants[0].species;
        var tSolidCoefficient = iReaction.reactants[0].coefficient;    //  coefficient of left hand side

        //  calculate the Ksp required if the entire amount were to dissolve
        //  tMoles is the total number of moles for each species among the products

        var tFinalContentsWouldBe = {};
        var tFinalProductOfUpdatedConcentrations = 1;
        var tFluidVolume = iContents.fluidVolume();   //  in L, todo: disregarding volume change of H2O solution

        //  begin by calculating whether it WILL fully dissolve (and we won't solve the equation...)

        iReaction.products.forEach(function (ixProduct) {
            var tFinalMolesOfThisProduct = iContents.solutes[ixProduct.species] || 0;         //  NB: evaluates to zero if the species is not present
            var tFinalMolarity = (tFinalMolesOfThisProduct / (tFluidVolume));  //  would be moles per liter, if fully dissolved.
            tFinalProductOfUpdatedConcentrations *= Math.pow(tFinalMolarity, ixProduct.coefficient);
        });

        //  now all the solutes are in the solution, even if they don't deserve it

        var tFullyDissolves = iReaction.Ksp > tFinalProductOfUpdatedConcentrations;

        if (tFullyDissolves) {     //   and we won't precipitate
            console.log("   " + iSolidNameString + " completely dissolves. Now " + iContents.shortString());
        } else {        //  some precipitate is left

/*
              construct an equilibrium expression using the first product species increase as x
              remember this is the increase in MOLARITY
              (so the solution should be negative)
              solve it using Newton's method
*/

            var tSpeciesExpressionArray = [];
            var tCoefficientProduct = 1;    //      product of the PRODUCT coefficients, used to find the initial value
            var tCoefficientSum = 0;

            iReaction.products.forEach(function (p) { //  loop over all the products, put the ions into the contents
                var tMolarityAlreadyThere = (iContents.solutes[p.species] / tFluidVolume) || 0;
                var tThisSpeciesExpression = "(" + p.coefficient + "*x + " + tMolarityAlreadyThere + ")";    //  no reactant coefficient, right?
                for (var i = 0; i < p.coefficient; i++) {
                    tSpeciesExpressionArray.push(tThisSpeciesExpression);
                }
                tCoefficientProduct *= p.coefficient;
                tCoefficientSum += p.coefficient;
            });
            var tExpression = tSpeciesExpressionArray.join("*");
            var tInitialValue = 0;  //  - Math.pow(dissolutionReaction.Ksp / tCoefficientProduct, 1 / tCoefficientSum);

            tExpression += " - " + iReaction.Ksp;

            //  solve the equation using Newton's method

            var newtonResult = TEEUtils.newtonsMethod(tExpression, tInitialValue, iReaction.Ksp * .00001);  //  todo: should the initial value be the current concentration?

            if (newtonResult.success) {
                console.log("Precipitate: Newton solution of " + tExpression + " = 0 is " + newtonResult.x.toFixed(4) +
                    " (" + newtonResult.iterations + " iters)");
                if (newtonResult.x > 0) {
                    alert("Precipitate: Positive result from Newton's method. Should be negative.");
                }
            } else {
                alert("Newton solution failed in precipitate()");
            }

            var tAdditionalMolarity = newtonResult.x;

/*
              use the result (x) to increase the amount of precipitate.
              How many moles will be used? tAdditionalMolarity * volume
*/

            iContents.addMolesOfSwirly( iSolidNameString, -tAdditionalMolarity * tFluidVolume * tSolidCoefficient)

            //  use the result (x) to decrease the amounts of solutes in the iContents (x should be negative)

            iReaction.products.forEach(function (p) { //  loop over all the products, put the ions into the contents
                iContents.addMolesOfSolute(p.species, tAdditionalMolarity * tFluidVolume * p.coefficient);
            });
        }
    },


    reactionUsingOnly: function (iReactantString) {
        var oReaction = null;
        Chemistry.reactions.forEach(function (r) {      //  todo: change to a reduce instead of forEach
            if (r.reactants[0].species === iReactantString && r.reactants.length === 1) {
                oReaction = r;
            }
        });
        return oReaction;
    },

    initialize: function () {
        this.loadReactionList();
    },

    loadReactionList: function () {
        Chemistry.reactionList.forEach(function (rr) {
            var tReaction = new Reaction(rr.reactants, rr.products);
            tReaction.Keq = 0 || rr.Keq;
            tReaction.Ksp = 0 || rr.Ksp;
            Chemistry.reactions.push(tReaction);
        });
    },

    symbols: {
        equilibrium: "\u21cc",
        minus: "\u2013"
    }

};