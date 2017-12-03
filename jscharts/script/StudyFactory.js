/* global Study, StudyIncomeGenerator, StudyPivotPoints, StudyAccDst, StudyADXR, StudyAMA, StudyAroon, StudyATR, StudyBol, StudyBolBandWidth, StudyBOS, StudyBuySellVolumeMA, StudyCCI, StudyCCIMACrossover, StudyChaikin, StudyChaikinVol, StudyChandeMomentum, StudyChoppiness, StudyCMoney, StudyCMoneyPersistence, StudyCoppock, StudyDeltaWeightedMovingAverage, StudyDisparity, StudyDMI, StudyDonchian, StudyDPO, StudyEff, StudyEMA, StudyFastSlowKurtosis, StudyFlow, StudyFractalDimension, StudyGirella, StudyHighLow, StudyHighLowMA, StudyHir, StudyHist, StudyIchimoku, StudyKeltner, StudyLevel2Histogram, StudyLinearRegression, StudyLinearRegressionDetrended, StudyKurtosis, StudyMpointer, StudyMx, StudySMA, StudyMACD, StudyMACDHistogram, StudyMAEnvelope, StudyMass, StudyMom, StudyOBV, StudyPathLength, StudyPO, StudyPointAndFigure, StudyRenko, StudyReturns, StudyROC, StudyRSI, StudySAR, StudySkew, StudySkewBands, StudyStdDeviation, StudySto, StudyStochRSI, StudyThreeLineBreak, StudyTripleMA, StudyTrueStrengthIndicator, StudyUltimate, StudyVMA, StudyVol, StudyVolatility, StudyVolatilityRatio, StudyVolPlus, StudyVolumeAccumulation, StudyVolumeAMA, StudyVolumeEMA, StudyVolumeMA, StudyVOsc, StudyVWAP, StudyWilliams, StudyWMA, StudyZigZag, StudyZone */
/**
 * ------------
 * StudyFactory
 * ------------
 */
Study.studyClasses = [StudyIncomeGenerator, StudyPivotPoints, StudyAccDst, StudyADXR, StudyAMA, StudyAroon, StudyATR, StudyBol, StudyBolBandWidth, StudyBOS, StudyBuySellVolumeMA, StudyCCI, StudyCCIMACrossover, StudyChaikin, StudyChaikinVol, StudyChandeMomentum, StudyChoppiness, StudyCMoney, StudyCMoneyPersistence, StudyCoppock, StudyDeltaWeightedMovingAverage, StudyDisparity, StudyDMI, StudyDonchian, StudyDPO, StudyEff, StudyEMA, StudyFastSlowKurtosis, StudyFlow, StudyFractalDimension, StudyGirella, StudyHighLow, StudyHighLowMA, StudyHir, StudyHist, StudyIchimoku, StudyKeltner, StudyLevel2Histogram, StudyLinearRegression, StudyLinearRegressionDetrended, StudyKurtosis, StudyMpointer, StudyMx, StudySMA, StudyMACD, StudyMACDHistogram, StudyMAEnvelope, StudyMass, StudyMom, StudyOBV, StudyPathLength, StudyPO, StudyPointAndFigure, StudyRenko, StudyReturns, StudyROC, StudyRSI, StudySAR, StudySkew, StudySkewBands, StudyStdDeviation, StudySto, StudyStochRSI, StudyThreeLineBreak, StudyTripleMA, StudyTrueStrengthIndicator, StudyUltimate, StudyVMA, StudyVol, StudyVolatility, StudyVolatilityRatio, StudyVolPlus, StudyVolumeAccumulation, StudyVolumeAMA, StudyVolumeEMA, StudyVolumeMA, StudyVOsc, StudyVWAP, StudyWilliams, StudyWMA, StudyZigZag, StudyZone];
var StudyFactory = new Object();
StudyFactory.studies = new Object();
for (var i = 0; i < Study.studyClasses.length; i++) {
    var c = Study.studyClasses[i];
    if (c.hasOwnProperty("mnemonic")) {
        StudyFactory.studies[c.mnemonic] = c;
    }
}
/**
 * @param {Overlay} ov
 * @param {string} mnemonic
 */
StudyFactory.getStudy = function(ov, mnemonic) {
    var c = StudyFactory.studies[mnemonic];
    if (c === undefined) {
        console.error("Undefined study:", mnemonic);
        return;
    }
    var moo = c.newInstance(ov);
    moo.setName();
    moo._initLegend();
    return moo;
}
/**
 * @param {string} mnemonic
 */
StudyFactory.getHelpCode = function(mnemonic) {
    var c = StudyFactory.studies[mnemonic];
    if (!c) return;
    return c.helpID;
}
/**
 * @param {string} mnemonic
 */
StudyFactory.studyHasOverlay = function(mnemonic) {
    var c = StudyFactory.studies[mnemonic];
    if (!c) return;
    return c.ownOverlay === undefined ? false : c.ownOverlay;
}