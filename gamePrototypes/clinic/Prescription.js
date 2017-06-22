/**
 * Created by tim on 6/20/17.
 */

var Prescription;

Prescription = function(iWhat, iDose, iCount, iRateType, iRate) {
    this.what = iWhat;      //  what the drug is, e.g., "ibuprofen"
    this.dose = iDose;        //  amount per dose, e.g., 200
    this.count = iCount;        //  number in the Rx, e.g., 12
    this.rateType = iRateType;  //  see the constants
    this.rate = iRate;          //  number associated with the rate type, e.g., 3 (per day)
    this.nextDose = this.timeOfNextDose();       //  Date (as date object) for next dose
};


Prescription.constants = {
    kRateTypePerDay : 1,
    kRateTypeHoursPerDose : 2,
    kRateTypeAsNeeded : 3
};

/**
 *
 * @returns {Date}
 */
Prescription.prototype.timeOfNextDose = function() {
    var tInterval = -1;
    switch(this.rateType) {
        case Prescription.constants.kRateTypePerDay:
            tInterval = 86400 * 1000 / this.rate;
            break;
        case Prescription.constants.kRateTypeHoursPerDose:
            tInterval = this.rate * 3600 * 1000
            break;
        default:
            break;
    }

    var tNow = clinic.state.now.getTime();  //  in ms
    var tNewTime = (Math.floor(tNow/tInterval) + 1) * tInterval;

    return new Date(tNewTime);
};

Prescription.prototype.empty = function() {
    return this.count === 0;
};

Prescription.prototype.updatePrescription = function() {
    var oTakeOne = false;
    var tNow = clinic.state.now;
    if (tNow.getTime() > this.nextDose.getTime()) {     //  time to take one
        this.nextDose = this.timeOfNextDose();
        oTakeOne = true;
        this.count--;
    }

    return oTakeOne;
};