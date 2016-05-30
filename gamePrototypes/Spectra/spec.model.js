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

/* global Spectrum, Line, spec */

spec.model = {

    elementalSpectra: [],
    labSpectrographGain: 1,
    labBlackbodyTemperature: 5500,    //  of the testbed blackbody radiator
    skyObjectBlackbodyTemperature: 5500,
    dischargeTube: null,
    labSpectrum: null,
    skySpectrum: null,

    initialize: function () {
        this.setUpElementalSpectra();
    },

    installBlackbody: function () {
        this.labSpectrum = new Spectrum();
        this.labSpectrum.hasBlackbody = true;
        this.labSpectrum.hasEmissionLines = false;
        this.labSpectrum.blackbodyTemperature = this.labBlackbodyTemperature;
    },

    installDischargeTube: function () {
        this.labSpectrum = new Spectrum();

        this.labSpectrum.hasBlackbody = false;
        this.labSpectrum.hasEmissionLines = true;

        switch (this.dischargeTube) {
            case "Hydrogen":
                this.labSpectrum.addLinesFrom(this.elementalSpectra.H, 100);
                break;

            case "Helium":
                this.labSpectrum.addLinesFrom(this.elementalSpectra.He, 100);
                break;

            case "Sodium":
                this.labSpectrum.addLinesFrom(this.elementalSpectra.NaI, 100);
                break;

            case "Calcium":
                this.labSpectrum.addLinesFrom(this.elementalSpectra.CaII, 100);
                break;
        }
    },

    /**
     * Make a spectrum for a star.
     * Late May 2016: assume some medium abundance and just use temperature to determine the spectrum and species.
     * Later we'll take stellar age into account, or otherwise determine abundance
     *
     * @param iTemp     temperature of the photosphere
     * @param iSpeed    speed away, used for Doppler shift
     */
    createStellarSpectrum: function (iTemp, iSpeed) {
        console.log('model.createSpellarSpectrum at ' + iTemp + "K");
        var oSpectrum = new Spectrum();

        oSpectrum.speedAway = iSpeed;
        oSpectrum.blackbodyTemperature = iTemp;
        oSpectrum.hasBlackbody = true;
        oSpectrum.hasAbsorptionLines = true;
        oSpectrum.hasEmissionLines = false;
        oSpectrum.addLinesFrom(this.elementalSpectra.H, 50);
        oSpectrum.addLinesFrom(this.elementalSpectra.He, 30);
        oSpectrum.addLinesFrom(this.elementalSpectra.NaI, 40);
        oSpectrum.addLinesFrom(this.elementalSpectra.CaII, 30);

        oSpectrum.source.brightness = 60 + Math.random() * 20;

        return oSpectrum;

    },


    /**
     * Called from initialize
     */
    setUpElementalSpectra: function () {
        var tSpectrum;

        //  Hydrogen
        tSpectrum = new Spectrum();         //  http://physics.nist.gov/cgi-bin/ASD/lines1.pl  //   divide intensities by 5000
        tSpectrum.addLine(new Line(656.2771534, 1, 100));
        tSpectrum.addLine(new Line(486.135, 1, 36));
        tSpectrum.addLine(new Line(434.0472, 1, 18));
        tSpectrum.addLine(new Line(410.1734, 1, 14));
        tSpectrum.addLine(new Line(397.0075, 1, 6));
        tSpectrum.addLine(new Line(388.9064, 1, 14));
        this.elementalSpectra.H = tSpectrum;

        //  Helium
        tSpectrum = new Spectrum();         //  http://physics.nist.gov/cgi-bin/ASD/lines1.pl  //   divide intensities by 5
        tSpectrum.addLine(new Line(381.96074, 1, 2));
        tSpectrum.addLine(new Line(383.3554, 1, 0.6));
        tSpectrum.addLine(new Line(387.1791, 1, 0.2));
        tSpectrum.addLine(new Line(388.8648, 1, 100));
        tSpectrum.addLine(new Line(396.47291, 1, 4));
        tSpectrum.addLine(new Line(402.61914, 1, 10));
        tSpectrum.addLine(new Line(412.08154, 1, 2.4));
        tSpectrum.addLine(new Line(438.79296, 1, 2));
        tSpectrum.addLine(new Line(447.14802, 1, 40));
        tSpectrum.addLine(new Line(447.16832, 1, 5));
        tSpectrum.addLine(new Line(471.31457, 1, 6));
        tSpectrum.addLine(new Line(492.19313, 1, 4));
        tSpectrum.addLine(new Line(501.56783, 1, 20));
        tSpectrum.addLine(new Line(504.7738, 1, 2));
        tSpectrum.addLine(new Line(587.5621, 1, 100));
        tSpectrum.addLine(new Line(587.5966, 1, 20));
        tSpectrum.addLine(new Line(667.8151, 1, 20));
        this.elementalSpectra.He = tSpectrum;

        //  Ca II (singly ionized)
        tSpectrum = new Spectrum();         //  http://physics.nist.gov/cgi-bin/ASD/lines1.pl  //   divide intensities by 2.5
        tSpectrum.addLine(new Line(370.6024, 1, 68));
        tSpectrum.addLine(new Line(373.6902, 1, 72));
        tSpectrum.addLine(new Line(393.3663, 1, 92));        //  K 3934
        tSpectrum.addLine(new Line(396.8469, 1, 88));        //  H 3968

        tSpectrum.addLine(new Line(409.7098, 1, 20));
        tSpectrum.addLine(new Line(410.9815, 1, 24));
        tSpectrum.addLine(new Line(411.0282, 1, 12));
        tSpectrum.addLine(new Line(420.6176, 1, 16));
        tSpectrum.addLine(new Line(422.0071, 1, 20));

        tSpectrum.addLine(new Line(500.1479, 1, 28));
        tSpectrum.addLine(new Line(501.9971, 1, 32));
        tSpectrum.addLine(new Line(502.1138, 1, 16));
        tSpectrum.addLine(new Line(528.5266, 1, 24));
        tSpectrum.addLine(new Line(530.7224, 1, 28));

        tSpectrum.addLine(new Line(645.687, 1, 32));


        this.elementalSpectra.CaII = tSpectrum;


        //  Na I (neutral)
        tSpectrum = new Spectrum();         //  http://physics.nist.gov/cgi-bin/ASD/lines1.pl  //   only the D doublet :)
        tSpectrum.addLine(new Line(588.995, 1, 100));
        tSpectrum.addLine(new Line(589.5924237, 1, 50));     //  D
        this.elementalSpectra.NaI = tSpectrum;

    }
};