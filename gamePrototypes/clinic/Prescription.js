/**
 * Created by tim on 6/20/17.
 */

var Prescription;

Prescription = function(iMedCode, iCount, iRateType, iRate) {
    //  iMedCode is the internal code, e.g., "ibu200"
    this.what = staticMeds[iMedCode].name;      //  what the drug is, e.g., "ibuprofen"
    this.dose = staticMeds[iMedCode].dosage;        //  amount per dose, e.g., 200
    this.originalCount = iCount;    //  number in the Rx, e.g., 12.
    this.count = iCount;        //  number of doses remaining.
    this.rateType = iRateType;  //  see the constants
    this.rate = iRate;          //  number associated with the rate type, e.g., 3 (per day)
    this.nextDoseDateTime = this.timeOfNextDose();       //  Date (as date object) for next dose
};


Prescription.constants = {
    kRateTypePerDay : 1,
    kRateTypeHoursPerDose : 2,
    kRateTypeAsNeeded : 3
};

/**
 *  Computes when the next dose is
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
    if (tNow.getTime() > this.nextDoseDateTime.getTime()) {     //  time to take one
        this.nextDoseDateTime = this.timeOfNextDose();
        oTakeOne = true;
        this.count--;
    }

    return oTakeOne;
};