/**
 * Created by tim on 6/22/17.
 */

var staticPaths = {

    //  basic fever virus
    A1B1 : {
        initialConcentration : 4000,
        fever : 2.8,
        prevalence : 0.01            //      on average, so the probability is prevalence / initialConcentration
    },

    //  basic stomach ick bacterium
    dColi : {
        initialConcentration : 40000,   //  lasts a long time! (28 days)
        fever : 0,
        prevalence : 0.001,
        nausea : 1,
        diarrhea : 1
    }

};

var symptoms = {
    fever : {
        reports : [
            "dizzy",
            "hot",
            "hot and cold",
            "sweaty",
            "achy",
            "low appetite",
            "shivery"
        ]
    },

    nausea : {
        reports : [
            "threw up",
            "dizzy",
            "nauseous"
        ]
    },

    diarrhea : {

    },

    hypotension : {

    }
};