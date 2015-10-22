/*
 ==========================================================================
 TEEUtils.js

 Collection of utility functions before they get merged into common.

 Author:   Tim Erickson

 Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.

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
 * Created by tim on 10/20/15.
 */

/**
 * A funky random Poisson function.
 * Use Knuth algorithm up to n = 100; normal approximation beyond that.
 * @param mean
 * @returns {number}
 */
function    randomPoisson( mean ) {

    if (mean > 100) {
        var sd = Math.sqrt(mean);
        return Math.round(randomNormal(mean,sd));   //  todo: use randomNormal from common
    }
    var L = Math.exp(-mean);
    var p = 1.0;
    var k = 0;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return (k - 1);
}

/**
 * Random normal, Box-Muller transform. Use only one value.
 * @param mean
 * @param sd
 * @returns {*}
 */
function    randomNormal(mean,sd) {
    var t1 = Math.random();
    var t2 = Math.random();

    var tZ = Math.sqrt(-2 * Math.log(t1)) * Math.cos(2 * Math.PI*t2);

    return mean + sd * tZ;
}

function    pickRandomItemFrom( a ) {
    var tL = a.length;
    var tR = Math.floor(Math.random() * tL);
    return a[tR];
}