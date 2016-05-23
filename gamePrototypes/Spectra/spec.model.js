/**
 * Created by tim on 5/23/16.


 ==========================================================================
 spec.model.js in data-science-games.

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


spec.model = {

    elementalSpectra : [],

    initialize : function() {
        this.setUpElementalSpectra();
    },


    getSpectrumFor : function( iWhat )  {
        var oSpectrum = null;

        switch( iWhat ) {
            case "Hydrogen":
                oSpectrum = this.elementalSpectra['H'];
                break;

            case "Helium":
                oSpectrum = this.elementalSpectra['He'];
                break;

            case "Sodium":
                oSpectrum = this.elementalSpectra['Na'];
                break;

            case "Calcium":
                oSpectrum = this.elementalSpectra['Ca'];
                break;
        }

        return oSpectrum;
    },


    setUpElementalSpectra : function() {
        var tSpectrum;

        //  Hydrogen
        tSpectrum = new Spectrum();         //  http://physics.nist.gov/cgi-bin/ASD/lines1.pl  //   divide intensities by 5000
        tSpectrum.addLine(new Line(656.2771534,1,100));
        tSpectrum.addLine(new Line(486.135,1,36));
        tSpectrum.addLine(new Line(434.0472,1,18));
        tSpectrum.addLine(new Line(410.1734,1,14));
        tSpectrum.addLine(new Line(397.0075,1,6));
        tSpectrum.addLine(new Line(388.9064,1,14));
        this.elementalSpectra['H'] = tSpectrum;

        //  Helium
        tSpectrum = new Spectrum();         //  http://physics.nist.gov/cgi-bin/ASD/lines1.pl  //   divide intensities by 5
        tSpectrum.addLine(new Line(381.96074,1, 2));
        tSpectrum.addLine(new Line(383.3554,1,.6));
        tSpectrum.addLine(new Line(387.1791,1,.2));
        tSpectrum.addLine(new Line(388.8648,1,100));
        tSpectrum.addLine(new Line(396.47291,1,4));
        tSpectrum.addLine(new Line(402.61914,1,10));
        tSpectrum.addLine(new Line(412.08154,1,2.4));
        tSpectrum.addLine(new Line(438.79296,1,2));
        tSpectrum.addLine(new Line(447.14802,1,40));
        tSpectrum.addLine(new Line(447.16832,1,5));
        tSpectrum.addLine(new Line(471.31457,1,6));
        tSpectrum.addLine(new Line(492.19313,1,4));
        tSpectrum.addLine(new Line(501.56783,1,20));
        tSpectrum.addLine(new Line(504.7738,1,2));
        tSpectrum.addLine(new Line(587.5621,1,100));
        tSpectrum.addLine(new Line(587.5966,1,20));
        tSpectrum.addLine(new Line(667.8151,1,20));
        this.elementalSpectra['He'] = tSpectrum;

    }
}