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

            case "Iron (neutral)":
                this.labSpectrum.addLinesFrom(this.elementalSpectra.FeI, 100);
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

        //  Fe I (neutral)
        tSpectrum = new Spectrum();

        tSpectrum.addLine(new Line(374.556,1,100));	//	divide line intensity by 25,000
        tSpectrum.addLine(new Line(374.826,1,76.4));
        tSpectrum.addLine(new Line(344.061,1,54));
        tSpectrum.addLine(new Line(349.057,1,52.8));
        tSpectrum.addLine(new Line(344.099,1,51.6));
        tSpectrum.addLine(new Line(370.557,1,51.6));
        tSpectrum.addLine(new Line(372.256,1,51.6));
        tSpectrum.addLine(new Line(387.857,1,51.6));
        tSpectrum.addLine(new Line(347.545,1,48));
        tSpectrum.addLine(new Line(363.146,1,46));
        tSpectrum.addLine(new Line(374.948,1,46));
        tSpectrum.addLine(new Line(393.03,1,46));
        tSpectrum.addLine(new Line(374.59,1,44));
        tSpectrum.addLine(new Line(385.637,1,44));
        tSpectrum.addLine(new Line(389.971,1,42.8));
        tSpectrum.addLine(new Line(526.954,1,40.8));
        tSpectrum.addLine(new Line(358.119,1,40));
        tSpectrum.addLine(new Line(373.332,1,40));
        tSpectrum.addLine(new Line(382.444,1,40));
        tSpectrum.addLine(new Line(392.291,1,40));
        tSpectrum.addLine(new Line(404.581,1,40));
        tSpectrum.addLine(new Line(367.991,1,36.4));
        tSpectrum.addLine(new Line(346.586,1,34.8));
        tSpectrum.addLine(new Line(649.498,1,34.8));
        tSpectrum.addLine(new Line(361.877,1,33.2));
        tSpectrum.addLine(new Line(406.359,1,33.2));
        tSpectrum.addLine(new Line(432.576,1,33.2));
        tSpectrum.addLine(new Line(440.475,1,32.4));
        tSpectrum.addLine(new Line(356.538,1,30.4));
        tSpectrum.addLine(new Line(381.584,1,30.4));
        tSpectrum.addLine(new Line(382.588,1,30.4));
        tSpectrum.addLine(new Line(516.749,1,30.4));
        tSpectrum.addLine(new Line(375.823,1,29.6));
        tSpectrum.addLine(new Line(389.566,1,29.6));
        tSpectrum.addLine(new Line(532.804,1,29.6));
        tSpectrum.addLine(new Line(360.886,1,28.8));
        tSpectrum.addLine(new Line(407.174,1,28.4));
        tSpectrum.addLine(new Line(392.026,1,26));
        tSpectrum.addLine(new Line(427.176,1,25.2));
        tSpectrum.addLine(new Line(430.79,1,25.2));
        tSpectrum.addLine(new Line(344.388,1,24.8));
        tSpectrum.addLine(new Line(376.379,1,23.6));
        tSpectrum.addLine(new Line(382.782,1,23.6));
        tSpectrum.addLine(new Line(383.422,1,23.6));
        tSpectrum.addLine(new Line(388.628,1,22));
        tSpectrum.addLine(new Line(347.67,1,19.6));
        tSpectrum.addLine(new Line(640,1,19.6));
        tSpectrum.addLine(new Line(349.784,1,19.16));
        tSpectrum.addLine(new Line(376.719,1,18.28));
        tSpectrum.addLine(new Line(384.105,1,18.28));
        tSpectrum.addLine(new Line(522.719,1,17.48));
        tSpectrum.addLine(new Line(396.926,1,17.08));
        tSpectrum.addLine(new Line(370.925,1,15.92));
        tSpectrum.addLine(new Line(381.296,1,15.92));
        tSpectrum.addLine(new Line(537.149,1,15.56));
        tSpectrum.addLine(new Line(355.851,1,15.2));
        tSpectrum.addLine(new Line(384.044,1,15.2));
        tSpectrum.addLine(new Line(414.387,1,14.52));
        tSpectrum.addLine(new Line(368.746,1,14.2));
        tSpectrum.addLine(new Line(372.762,1,14.2));
        tSpectrum.addLine(new Line(352.604,1,13.56));
        tSpectrum.addLine(new Line(379.955,1,12.64));
        tSpectrum.addLine(new Line(379.5,1,12.36));
        tSpectrum.addLine(new Line(390.295,1,12.08));
        tSpectrum.addLine(new Line(639.36,1,12.08));
        tSpectrum.addLine(new Line(495.76,1,11.8));
        tSpectrum.addLine(new Line(358.532,1,11.52));
        tSpectrum.addLine(new Line(441.512,1,11.52));
        tSpectrum.addLine(new Line(527.036,1,11.52));
        tSpectrum.addLine(new Line(387.802,1,11));
        tSpectrum.addLine(new Line(358.698,1,10.76));
        tSpectrum.addLine(new Line(642.135,1,10.28));
        tSpectrum.addLine(new Line(379.851,1,10.04));
        tSpectrum.addLine(new Line(388.705,1,10.04));
        tSpectrum.addLine(new Line(374.336,1,9.8));
        tSpectrum.addLine(new Line(667.798,1,9.6));
        tSpectrum.addLine(new Line(387.25,1,9.36));
        tSpectrum.addLine(new Line(390.648,1,9.36));
        tSpectrum.addLine(new Line(378.788,1,8.96));
        tSpectrum.addLine(new Line(413.206,1,8.96));
        tSpectrum.addLine(new Line(426.047,1,8.96));
        tSpectrum.addLine(new Line(654.624,1,8.96));
        tSpectrum.addLine(new Line(641.165,1,8.76));
        tSpectrum.addLine(new Line(425.079,1,8.56));
        tSpectrum.addLine(new Line(400.524,1,8.36));
        tSpectrum.addLine(new Line(643.084,1,8.36));
        tSpectrum.addLine(new Line(305.909,1,8.16));
        tSpectrum.addLine(new Line(384.997,1,8.16));
        tSpectrum.addLine(new Line(388.851,1,8));
        tSpectrum.addLine(new Line(492.05,1,7.8));
        tSpectrum.addLine(new Line(351.382,1,7.64));
        tSpectrum.addLine(new Line(360.668,1,7.64));
        tSpectrum.addLine(new Line(544.692,1,7.28));
        tSpectrum.addLine(new Line(386.552,1,7.12));
        tSpectrum.addLine(new Line(358.571,1,6.64));
        tSpectrum.addLine(new Line(517.16,1,6.48));
        tSpectrum.addLine(new Line(659.291,1,6.2));
        tSpectrum.addLine(new Line(420.203,1,5.92));
        tSpectrum.addLine(new Line(340.746,1,5.8));
        tSpectrum.addLine(new Line(540.577,1,5.8));
        tSpectrum.addLine(new Line(542.97,1,5.8));
        tSpectrum.addLine(new Line(438.354,1,5.64));
        tSpectrum.addLine(new Line(342.712,1,5.52));
        tSpectrum.addLine(new Line(357.025,1,5.52));
        tSpectrum.addLine(new Line(437.593,1,5.52));
        tSpectrum.addLine(new Line(539.713,1,5.28));
        tSpectrum.addLine(new Line(302.403,1,4.92));
        tSpectrum.addLine(new Line(523.294,1,4.92));
        tSpectrum.addLine(new Line(302.584,1,4.8));
        tSpectrum.addLine(new Line(305.745,1,4.8));
        tSpectrum.addLine(new Line(379.009,1,4.8));
        tSpectrum.addLine(new Line(376.005,1,4.68));
        tSpectrum.addLine(new Line(442.731,1,4.68));
        tSpectrum.addLine(new Line(489.149,1,4.68));
        tSpectrum.addLine(new Line(376.554,1,4.6));
        tSpectrum.addLine(new Line(545.561,1,4.6));
        tSpectrum.addLine(new Line(355.492,1,4.4));
        tSpectrum.addLine(new Line(302.049,1,4.28));
        tSpectrum.addLine(new Line(543.452,1,4.28));
        tSpectrum.addLine(new Line(532.853,1,4.2));
        tSpectrum.addLine(new Line(352.617,1,4));
        tSpectrum.addLine(new Line(303.739,1,3.92));
        tSpectrum.addLine(new Line(370.792,1,3.72));
        tSpectrum.addLine(new Line(385.082,1,3.64));
        tSpectrum.addLine(new Line(423.594,1,3.56));
        tSpectrum.addLine(new Line(428.24,1,3.56));
        tSpectrum.addLine(new Line(319.323,1,3.48));
        tSpectrum.addLine(new Line(365.147,1,3.48));
        tSpectrum.addLine(new Line(427.115,1,3.48));
        tSpectrum.addLine(new Line(300.814,1,3.4));
        tSpectrum.addLine(new Line(362.146,1,3.4));
        tSpectrum.addLine(new Line(364.951,1,3.4));
        tSpectrum.addLine(new Line(300.095,1,3.24));
        tSpectrum.addLine(new Line(370.782,1,3.24));
        tSpectrum.addLine(new Line(385.921,1,3.24));
        tSpectrum.addLine(new Line(534.102,1,3.24));
        tSpectrum.addLine(new Line(378.595,1,3.16));
        tSpectrum.addLine(new Line(532.418,1,3.12));
        tSpectrum.addLine(new Line(399.739,1,3.04));
        tSpectrum.addLine(new Line(373.24,1,2.96));
        tSpectrum.addLine(new Line(446.165,1,2.96));
        tSpectrum.addLine(new Line(640.802,1,2.96));
        tSpectrum.addLine(new Line(519.494,1,2.88));
        tSpectrum.addLine(new Line(425.012,1,2.84));
        tSpectrum.addLine(new Line(659.387,1,2.84));
        tSpectrum.addLine(new Line(491.899,1,2.76));
        tSpectrum.addLine(new Line(306.724,1,2.72));
        tSpectrum.addLine(new Line(360.545,1,2.72));
        tSpectrum.addLine(new Line(364.039,1,2.72));
        tSpectrum.addLine(new Line(322.579,1,2.64));
        tSpectrum.addLine(new Line(495.73,1,2.64));
        tSpectrum.addLine(new Line(382.118,1,2.6));
        tSpectrum.addLine(new Line(452.861,1,2.6));
        tSpectrum.addLine(new Line(501.207,1,2.6));
        tSpectrum.addLine(new Line(633.682,1,2.6));
        tSpectrum.addLine(new Line(387.376,1,2.52));
        tSpectrum.addLine(new Line(414.341,1,2.52));
        tSpectrum.addLine(new Line(487.132,1,2.52));
        tSpectrum.addLine(new Line(666.344,1,2.52));
        tSpectrum.addLine(new Line(341.313,1,2.48));
        tSpectrum.addLine(new Line(358.466,1,2.48));
        tSpectrum.addLine(new Line(368.305,1,2.48));
        tSpectrum.addLine(new Line(431.508,1,2.48));
        tSpectrum.addLine(new Line(354.108,1,2.4));
        tSpectrum.addLine(new Line(379.434,1,2.4));
        tSpectrum.addLine(new Line(300.728,1,2.32));
        tSpectrum.addLine(new Line(367.763,1,2.32));
        tSpectrum.addLine(new Line(429.412,1,2.32));
        tSpectrum.addLine(new Line(489.075,1,2.32));
        tSpectrum.addLine(new Line(521.627,1,2.32));
        tSpectrum.addLine(new Line(361.016,1,2.24));
        tSpectrum.addLine(new Line(504.176,1,2.24));
        tSpectrum.addLine(new Line(362.2,1,2.16));
        tSpectrum.addLine(new Line(421.618,1,2.16));
        tSpectrum.addLine(new Line(422.743,1,2.16));
        tSpectrum.addLine(new Line(300.957,1,2.08));
        tSpectrum.addLine(new Line(354.208,1,2.08));
        tSpectrum.addLine(new Line(418.779,1,2.08));
        tSpectrum.addLine(new Line(675.015,1,2.08));
        tSpectrum.addLine(new Line(328.675,1,2.04));
        tSpectrum.addLine(new Line(526.655,1,2.04));
        tSpectrum.addLine(new Line(633.533,1,2.04));
        tSpectrum.addLine(new Line(358.611,1,2));
        tSpectrum.addLine(new Line(362.319,1,2));
        tSpectrum.addLine(new Line(384.326,1,2));

        this.elementalSpectra.FeI = tSpectrum;
    }
};