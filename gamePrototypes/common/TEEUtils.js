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