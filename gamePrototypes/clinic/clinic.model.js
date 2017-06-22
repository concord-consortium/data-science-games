/**
 * Created by tim on 3/7/17.


 ==========================================================================
 clinic.model.js in gamePrototypes.

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


clinic.model = {

    population: [],     //  array of Patients. Everybody.
    dwellings : {},     //  object containing every dwelling, dwelling IDs as keys.

    patientsAtClinic: [],      //  a subset of population. The people in our clinic.

    /**
     * Create the clinic.model.dwellings _object_ from the initial static array.
     * It's an object so that we can key into it when we make the people.
     *
     * Called from clinic.setUp()
     */
    constructDwellingArray: function () {
        clinic.initialDwellings.forEach(function (d) {      //  initialDwellings are defined in staticPeopleAndDwellings.js
            var tKey = d.dwellingID;
            clinic.model.dwellings[tKey] = {
                lat : d.lat,
                long : d.long,
                address : d.address,
                zip : d.zip
            };       //   our internal object of Dwellings
        })
    },

    /**
     * Create the clinic.model.population _array_.
     *
     * Note that dwellings have to be made first so that we can create the codap population cases
     * which contain information from the dwelling data.
     *
     * Note that the population array is made up of instances of Patient.
     *
     * called from clinic.setUp()
     */
    constructPopulationArray: function () {
        var batchedPatientValues = [];

        clinic.initialPeople.forEach(function (p) {      //  initialPeople are defined in staticPeopleAndDwellings.js
            var tPatient = new Patient(p);
            clinic.model.population.push(tPatient);       //   our internal array of Patients
            batchedPatientValues.push(tPatient.populationValueObject());
        });
        clinic.codapConnector.createPopulationItems(batchedPatientValues);   //  tPatient.populationValueObject());   //  CODAP case
    },


    initializeClinicModelData : function() {
        $('#currentStatus').text("prepping the population");

        clinic.model.population.forEach( function(p) {
            var tHealth = clinic.state.health[p.patientID];

            //  todo: improve and generalize these temporary measures...

            tHealth.A1B1 = Math.random() < 0.02 ? 4000 : 100 ;  //  4000 minutes is about 3 days
            tHealth.ibuprofenConcentration = 0;
            tHealth.acetaminophenConcentration = 0;
            tHealth.ibuprofenInQueue = 0;
            tHealth.acetaminophenInQueue = 0;

        })
    },


    passTime: function (minutes) {
        clinic.state.now = new Date(clinic.state.now.getTime() + minutes * 60000);

        this.population.forEach(function (p) {
            p.updatePatient( minutes );
        });
        clinicManager.updateDisplay();
    },

    newDay : function() {
        //  push the date forward

        var dt = 0;
        var newDate = new Date();
        newDate.setHours(clinic.constants.kClinicOpenHour, 0, 0);

        if (clinic.state.now === null) {    //  if there is no date, make a brand new one
            clinic.state.now = newDate;
        } else {
            var tDate = clinic.state.now.getDate() + 1; //  the day number, advanced 1
            newDate.setDate( tDate );
            newDate.setHours( clinic.constants.kClinicOpenHour, 0, 0);  //  set to opening time on that day

            while (newDate.getTime() > clinic.state.now.getTime()) {
                this.passTime( 10 );    //  update everybody's maladies, prescriptions, etc.
            }
        }

        this.patientsAtClinic = [];


        //  see who is sick
        this.population.forEach( function(p) {
            if (health.wantsToGoToClinic(p)) {
                clinicManager.arrivesAtClinic(p);
            }
        })
        clinicManager.updateDisplay();
    },

    /**
     *  UTILITIES!
     */

    patientsFromNameParts : function(iString) {
        var out = [];

        this.population.forEach( function(p) {
            if (p.name.includes(iString)) {
                out.push(p);
            }
        });

        return out;
    }
};
