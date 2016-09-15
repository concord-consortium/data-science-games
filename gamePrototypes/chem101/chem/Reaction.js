/**
 * Created by tim on 9/13/16.


 ==========================================================================
 Reaction.js in gamePrototypes.

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


Reaction = function( iReactants, iProducts ) {
    this.reactants = iReactants;    //  array of objects, species and coefficient
    this.products = iProducts;      //  array
    /* example of a reaction array.
     [
        {species : "Na+", coefficient : 1},
        {species : "Cl-", coefficient : 1}
     ]);

     */

    this.Ksp = -1;
    this.Keq = -1;
};

Reaction.prototype.toString = function() {

    var tReactArray = [];

    this.reactants.forEach( function(r) {
        var s = r.species;
        if (r.coefficient > 1) {
            s = r.coefficient + s;
        }
        tReactArray.push( s );
    });

    var tProdArray = [];

    this.products.forEach( function(p) {
        var s = p.species;
        if (p.coefficient > 1) {
            s = p.coefficient + s;
        }
        tProdArray.push( s );
    });

    return tReactArray.join(" + ") + " " +
        Chemistry.symbols.equilibrium + " " +
        tProdArray.join(" + ");
};