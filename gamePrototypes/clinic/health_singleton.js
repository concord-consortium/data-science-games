/**
 * Created by tim on 1/25/16.
 */

//  todo: make Health a class.

/**
 * This singleton is responsible for changes and updates to a Patient's health.
 * This health is an object with a large number of potential fields.
 *
 * @type {{update: health.update, wantsToGoToClinic: health.wantsToGoToClinic, findTemperature: health.findTemperature, exponentialUpdate: health.exponentialUpdate}}
 */
var health = {

    /**
     * Called from clinic.model.passTime() in a loop over the population
     * @param iPerson
     * @param dt        in minutes
     */
    update: function (iPerson, dt) {
        var tHealth = clinic.state.health[iPerson.patientID];

        if (tHealth.A1B1 > 100) {       //  natural reduction by immune system
            tHealth.A1B1 -= dt;
            if (tHealth.A1B1 < 100) {
                tHealth.A1B1 = 100;
            }
        }

        var allMeds = Object.keys(staticMeds);

        allMeds.forEach(
            function (m) {
                var theMed = staticMeds[m];     //  the actual med object
                var inQueueKey = m + "InQueue";
                var concentrationKey = m + "Concentration";

                //  move med from queue to bloodstream (=Concentration)

                if (tHealth[inQueueKey]) {
                    var tMoving = (theMed.dosage / theMed.timeToBloodstream) * dt;  //  10 units per minute (= 200/20)
                    var tReallyMoving = tMoving <= tHealth[inQueueKey] ? tMoving : tHealth[inQueueKey];     //  pin at the queue amount
                    tHealth[concentrationKey] += tReallyMoving;
                    tHealth[inQueueKey] -= tReallyMoving;
                }

                //  drugs lose concentration over time
                tHealth[concentrationKey] = this.exponentialUpdate(0.5, theMed.halfLife, dt, tHealth[concentrationKey]);
            }.bind(this)
        );

    },

    wantsToGoToClinic: function (iPerson) {
        var tHealth = clinic.state.health[iPerson.patientID];
        var fever = this.findTemperature(iPerson).fever;

        return fever > 2.0;
    },

    findTemperature: function (iPerson) {
        var tHealth = clinic.state.health[iPerson.patientID];
        var o = iPerson.baseTemp - 0.2 + Math.random() * 0.4;

        var tFever = tHealth.A1B1 > 100 ? 2.8 + Math.random() * 0.4 : 0;  //  fever from A1B1

        var tIbuEffective = tHealth.ibuprofenConcentration > 100 ? 100 : tHealth.ibuprofenConcentration;
        var tAcetEffective = tHealth.acetaminophenConcentration > 100 ? 100 : tHealth.acetaminophenConcentration;
        var tFeverReduction = tIbuEffective > tAcetEffective ? tIbuEffective : tAcetEffective;

        tFever = tFever * (100 - tFeverReduction) / 100;
        o += tFever;

        return {temp: o, fever: tFever};
    },

    howAreYouFeeling: function (iPatient) {
        var tFeelings = [];
        var tHealth = clinic.state.health[iPatient.patientID];
        var tFever = this.findTemperature(iPatient).fever;

        if (tFever > 1.5) {
            tFeelings.push(TEEUtils.pickRandomItemFrom(this.feverFeelings));
        }

        var tOut = "Fine!";
        if (tFeelings.length > 0) {
            tOut = tFeelings.join(", ");
        }

        return tOut;
    },

    /**
     *
     * @param iFraction     What fraction we're using. 0.5 means half-life. 2.0 means doubling.
     * @param iTotalTime    What time it takes to decline (or increase) to iFraction
     * @param iTime         How much time we're talking about right now
     * @param iInitialValue What's the initial value?
     * @returns {number}    The final value, after iTime has elapsed.
     */
    exponentialUpdate: function (iFraction, iTotalTime, iTime, iInitialValue) {
        var tFrac = Math.pow(iFraction, iTime / iTotalTime);
        return iInitialValue * tFrac;
    },

    feverFeelings: [
        "dizzy",
        "hot",
        "hot and cold",
        "sweaty",
        "achy",
        "low appetite",
        "shivery"
    ]
}