/**
 * Created by tim on 8/17/16.


 ==========================================================================
 dbw.js in data-science-games.

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

/* global $, dsgSQL, console    */

var dbw = {

    dataConfiguration : "local",        //    "local"  or "remote" -- change for release

    initialize : function( ) {
        dsgSQL.setCredentials( dbw.constants.dbCredentials[ this.dataConfiguration ]);

        $("#credentials").text("Cred user = " + dsgSQL.user);   //  debug
    },

    getData : function() {
        dsgSQL.doPost( "", gotData );

        function gotData( iData ) {
            var theData = JSON.parse( iData );
            var stringData = JSON.stringify( theData );
            console.log( stringData );
            $("#resultString").html( stringData );
        }
    },


};


dbw.constants = {
    dbCredentials : {
        local : {
            host : "localhost",
            dbname : "dbw",
            user : "root",
            pass : "root",
            baseURL : "http://localhost:8888/dsg/dbw.php"
        },

        remote : {
            host : "www.eeps.com",
            dbname : "denofinq_dbw",
            user : "denofinq_dsg",
            pass : "dsg%37X",
            baseURL : "http://www.eeps.com/dsg/dbw.php" //  todo: make sure this URL is correct
        }
    }
};

