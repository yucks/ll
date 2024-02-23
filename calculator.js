var carType = fuelType = driveAwayPrice = leaseTerm = kmsPerYear = grossSalary = businessUse = '';

var carTypes = {
    1: {'type': 'Small Car / Hatch', 'fuelRate': 6.5, 'maintenanceRate': 2.5, 'insurance': 1500, 'tyreCost': 180},
    2: {'type': 'Sedan / SUV', 'fuelRate': 8.5, 'maintenanceRate': 3.5, 'insurance': 1800, 'tyreCost': 220},
    3: {'type': '4x4 / Ute', 'fuelRate': 9.5, 'maintenanceRate': 4, 'insurance': 1900, 'tyreCost': 320},
    4: {'type': 'Prestige / Performance', 'fuelRate': 11, 'maintenanceRate': 4.5, 'insurance': 2000, 'tyreCost': 350},
};

var leaseTerms = {
    1: {'type': '1 year', 'termMonths': 12, 'rvStandard': parseFloat(65.63/100), 'rvHigh': parseFloat(65.63/100)},
    2: {'type': '2 years', 'termMonths': 24, 'rvStandard': parseFloat(56.25/100), 'rvHigh': parseFloat(56.25/100)},
    3: {'type': '3 years', 'termMonths': 36, 'rvStandard': parseFloat(46.88/100), 'rvHigh': parseFloat(46.88/100)},
    4: {'type': '4 years', 'termMonths': 48, 'rvStandard': parseFloat(37.50/100), 'rvHigh': parseFloat(37.50/100)},
    5: {'type': '5 years', 'termMonths': 60, 'rvStandard': parseFloat(28.13/100), 'rvHigh': parseFloat(28.13/100)},
};

var taxRates = {
    1: {'minBracket': 0, 'maxBracket': 18200.99, 'marginalRate': 0},
    2: {'minBracket': 18201, 'maxBracket': 45000.99, 'marginalRate': parseFloat(19/100)},
    3: {'minBracket': 45001, 'maxBracket': 120000.99, 'marginalRate': parseFloat(32.50/100)},
    4: {'minBracket': 120001, 'maxBracket': 180000.99, 'marginalRate': parseFloat(37/100)},
    5: {'minBracket': 180001, 'maxBracket': false, 'marginalRate': parseFloat(45/100)},
};

var taxPaidInBracket = {
    1: 0,
    2: round((taxRates[2].maxBracket - taxRates[2].minBracket) * taxRates[2].marginalRate, 0),
    3: round((taxRates[3].maxBracket - taxRates[3].minBracket) * taxRates[3].marginalRate, 0),
    4: round((taxRates[4].maxBracket - taxRates[4].minBracket) * taxRates[4].marginalRate, 0),
    5: false,
};

var taxTotalPaid = {
    1: 0,
    2: round(taxPaidInBracket[1] + taxPaidInBracket[2], 0),
    3: round(taxPaidInBracket[2] + taxPaidInBracket[3], 0),
    4: round(taxPaidInBracket[2] + taxPaidInBracket[3] + taxPaidInBracket[4], 0),
    5: false,
};

var fuelTypes = {
    1: {'type': 'Petrol / Diesel', 'centsPerLitre': 215},
    2: {'type': 'Hybrid', 'centsPerLitre': 150},
    3: {'type': 'Electric / Plug-In Hybrid', 'centsPerLitre': 0}
};

function getNumericValue( value ) {
    return parseFloat(value.replace(/[^0-9.]/g, ''));
}

function round(value, decimals) {
    var negative = false;
    if ( value < 0 ) {
        negative = true;
        value = (value * -1);
    }
    var multiplicator = Math.pow(10, decimals);
    value = parseFloat((value * multiplicator));
    value = (Math.round(value) / multiplicator);
    if ( negative ) {
        value = (value * -1);
    }
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function rounddown(value, decimals) {
    var negative = false;
    if ( value < 0 ) {
        negative = true;
        value = (value * -1);
    }
    var multiplicator = Math.pow(10, decimals);
    value = parseFloat((value * multiplicator));
    value = (Math.floor(value) / multiplicator);
    if ( negative ) {
        value = (value * -1);
    }
    return Number(Math.floor(value + 'e' + decimals) + 'e-' + decimals);
}

function roundup(value, decimals) {
    var negative = false;
    if ( value < 0 ) {
        negative = true;
        value = (value * -1);
    }
    var multiplicator = Math.pow(10, decimals);
    value = parseFloat((value * multiplicator));
    value = (Math.ceil(value) / multiplicator);
    if ( negative ) {
        value = (value * -1);
    }
    return Number(Math.ceil(value + 'e' + decimals) + 'e-' + decimals);
}

function pmt(rate_per_period, number_of_payments, present_value, future_value, type){
    future_value = ( typeof future_value !== 'undefined' ? future_value : 0 );
    type = ( typeof type !== 'undefined' ? type : 0 );

    var rv = 0;
    if ( rate_per_period != 0.0 ) {
        // Interest rate exists
        var q = Math.pow(1 + rate_per_period, number_of_payments);
        rv = parseFloat((rate_per_period * (future_value + (q * present_value))) / ((-1 + q) * (1 + rate_per_period * (type)))) * -1;
    } else if ( number_of_payments != 0.0 ) {
        // No interest rate, but number of payments exists
        rv = parseFloat((future_value + present_value) / number_of_payments) * -1;
    }
    return rv;
}

function getIncomeTaxData(taxableSalaryWithoutPackaging, taxableSalaryStatutoryMethod, taxableSalaryOperatingCost) {
    var withoutPackaging = sfm = ocm = 0;
    var taxCalculations = {
        1: {
            'withoutPackaging': ( taxableSalaryWithoutPackaging < taxRates[2].minBracket ? 0 : 0 ),
            'sfm': ( taxableSalaryStatutoryMethod < taxRates[2].minBracket ? 0 : 0),
            'ocm': ( taxableSalaryOperatingCost < taxRates[2].minBracket ? 0 : 0 )
        },
        2: {
            'withoutPackaging': (
                (taxableSalaryWithoutPackaging < taxRates[3].minBracket && taxableSalaryWithoutPackaging > taxRates[1].maxBracket) ?
                (((taxableSalaryWithoutPackaging - taxRates[1].maxBracket) * taxRates[2].marginalRate) + taxTotalPaid[1]) : 0
            ),
            'sfm': (
                (taxableSalaryStatutoryMethod < taxRates[3].minBracket && taxableSalaryStatutoryMethod > taxRates[1].maxBracket) ?
                (((taxableSalaryStatutoryMethod - taxRates[1].maxBracket) * taxRates[2].marginalRate) + taxTotalPaid[1]) : 0
            ),
            'ocm': (
                (taxableSalaryOperatingCost < taxRates[3].minBracket && taxableSalaryOperatingCost > taxRates[1].maxBracket) ?
                (((taxableSalaryOperatingCost - taxRates[1].maxBracket) * taxRates[2].marginalRate) + taxTotalPaid[1])  : 0
            )
        },
        3: {
            'withoutPackaging':(
                (taxableSalaryWithoutPackaging < taxRates[4].minBracket && taxableSalaryWithoutPackaging > taxRates[2].maxBracket) ?
                (((taxableSalaryWithoutPackaging - taxRates[2].maxBracket) * taxRates[3].marginalRate) + taxTotalPaid[2]) : 0
            ),
            'sfm': (
                (taxableSalaryStatutoryMethod < taxRates[4].minBracket && taxableSalaryStatutoryMethod > taxRates[2].maxBracket) ?
                (((taxableSalaryStatutoryMethod - taxRates[2].maxBracket) * taxRates[3].marginalRate) + taxTotalPaid[2]) : 0
            ),
            'ocm': (
                (taxableSalaryOperatingCost < taxRates[4].minBracket && taxableSalaryOperatingCost > taxRates[2].maxBracket) ?
                (((taxableSalaryOperatingCost - taxRates[2].maxBracket) * taxRates[3].marginalRate) + taxTotalPaid[2]) : 0
            )
        },
        4: {
            'withoutPackaging': (
                (taxableSalaryWithoutPackaging < taxRates[5].minBracket && taxableSalaryWithoutPackaging > taxRates[3].maxBracket) ?
                (((taxableSalaryWithoutPackaging - taxRates[3].maxBracket) * taxRates[4].marginalRate) + taxTotalPaid[3]) : 0
            ),
            'sfm': (
                (taxableSalaryStatutoryMethod < taxRates[5].minBracket && taxableSalaryStatutoryMethod > taxRates[3].maxBracket) ?
                (((taxableSalaryStatutoryMethod - taxRates[3].maxBracket) * taxRates[4].marginalRate) + taxTotalPaid[3]) : 0
            ),
            'ocm': (
                (taxableSalaryOperatingCost < taxRates[5].minBracket && taxableSalaryOperatingCost > taxRates[3].maxBracket) ?
                (((taxableSalaryOperatingCost - taxRates[3].maxBracket) * taxRates[4].marginalRate) + taxTotalPaid[3]) : 0
            )
        },
        5: {
            'withoutPackaging': (
                taxableSalaryWithoutPackaging > taxRates[4].maxBracket ?
                (((taxableSalaryWithoutPackaging - taxRates[5].minBracket) * taxRates[5].marginalRate) + taxTotalPaid[4]) : 0
            ),
            'sfm': (
                taxableSalaryStatutoryMethod > taxRates[4].maxBracket ?
                (((taxableSalaryStatutoryMethod - taxRates[5].minBracket) * taxRates[5].marginalRate) + taxTotalPaid[4]) : 0
            ),
            'ocm': (
                taxableSalaryOperatingCost > taxRates[4].maxBracket ?
                (((taxableSalaryOperatingCost - taxRates[5].minBracket) * taxRates[5].marginalRate) + taxTotalPaid[4]) : 0
            )
        },
    };

    $.each(taxCalculations, function (bracket, data) {
        withoutPackaging += data.withoutPackaging;
        sfm += data.sfm;
        ocm += data.ocm;
    });

    return {
        'withoutPackaging': round(withoutPackaging, 2),
        'sfm': round(sfm, 2),
        'ocm': round(ocm, 2),
    }
}

$(function(){
    var allowCalculation = true;
    const requestParams = new URLSearchParams(window.location.search);

    function getCarTypeInput() {
        var rv = false;
        var value = ( requestParams.has('carType') ? requestParams.get('carType') : 'n/a' );
        $.each(carTypes, function(carTypeId, carTypeSettings){
            if ( carTypeId == value ) {
                rv = value;
            }
        });
        if ( !rv ) {
            allowCalculation = false;
        }
        return rv;
    }

    function getFuelTypeInput() {
        var rv = false;
        var value = ( requestParams.has('fuelType') ? requestParams.get('fuelType') : 'n/a' );
        $.each(fuelTypes, function(fuelTypeId, fuelTypeSettings){
            if ( fuelTypeId == value ) {
                rv = value;
            }
        });
        if ( !rv ) {
            allowCalculation = false;
        }
        return rv;
    }

    function getDriveAwayPriceInput() {
        var rv = false;
        var value = ( requestParams.has('driveAwayPrice') ? getNumericValue(requestParams.get('driveAwayPrice')) : 'n/a' );
        if ( /^\d+$/.test(value) ) {
            rv = value;
        }
        else {
            allowCalculation = false;
        }
        return rv;
    }

    function getLeaseTermInput() {
        var rv = false;
        var value = ( requestParams.has('leaseTerm') ? requestParams.get('leaseTerm') : 'n/a' );
        var valid = false;
        $.each(leaseTerms, function(leaseTermId, leaseTermSettings){
            if ( leaseTermId == value ) {
                rv = value;
            }
        });
        if ( !rv ) {
            allowCalculation = false;
        }
        return rv;
    }

    function getKmsPerYearInput() {
        var rv = false;
        var value = ( requestParams.has('kmsPerYear') ? getNumericValue(requestParams.get('kmsPerYear')) : 'n/a' );
        if ( /^\d+$/.test(value) ) {
            rv = value;
        }
        else {
            allowCalculation = false;
        }
        return rv;
    }

    function getGrossSalaryInput() {
        var value = ( requestParams.has('grossSalary') ? getNumericValue(requestParams.get('grossSalary')) : 'n/a' );
        if ( /^\d+$/.test(value) ) {
            rv = value;
        }
        else {
            allowCalculation = false;
        }
        return rv;
    }

    function getBusinessUseInput() {
        var rv = false;
        var value = ( requestParams.has('businessUse') ? getNumericValue(requestParams.get('businessUse')) : 'n/a' );
        if ( /^\d+$/.test(value) ) {
            rv = value;
        }
        else {
            allowCalculation = false;
        }
        return rv;
    }

    function calculateResults() {
        allowCalculation = true;

        carType = getCarTypeInput();
        fuelType = getFuelTypeInput();
        driveAwayPrice = getDriveAwayPriceInput();
        leaseTerm = getLeaseTermInput();
        kmsPerYear = getKmsPerYearInput();
        grossSalary = getGrossSalaryInput();
        businessUse = getBusinessUseInput();

        if ( allowCalculation ) {
            var numWeeksInYear = 52;//parseFloat(365/7);

            var brokerageFactor = parseFloat(8/100);
            var stampDutyFactor = parseFloat(3.95/100);
            var annualManagementFee = 456;
            var vehicleRegistrationFee = 900;
            var maxClaimableGST = 5885;

            var termMonths = leaseTerms[leaseTerm].termMonths;
            var evaluatedRV = ( kmsPerYear > 29999 ? 'high' : 'standard' );
            var rvPercentage = ( evaluatedRV == 'standard' ? leaseTerms[leaseTerm].rvStandard : leaseTerms[leaseTerm].rvHigh );

            var stampDuty = driveAwayPrice * stampDutyFactor;
            var driveAwaySubTotal = (driveAwayPrice - stampDuty - vehicleRegistrationFee);
            var driveAwaySubTotalExGST = round((driveAwaySubTotal - (driveAwaySubTotal/11)), 2);

            var claimableGST = round(((driveAwaySubTotal/11) >= maxClaimableGST ? maxClaimableGST : (driveAwaySubTotal/11)), 2);

            var fbtCostBase = driveAwaySubTotal;
            var vehicleFinanceAmount = (driveAwayPrice - claimableGST);
            var residualValue = round((vehicleFinanceAmount * rvPercentage), 2);

            var brokerage = round((vehicleFinanceAmount * brokerageFactor), 2);
            var docFee = 900;
            var totalAmountFinanced = (vehicleFinanceAmount + brokerage + docFee + 6);
            var interestRatePercentage = parseFloat(6.5/100);
            var financePayment = round((pmt((interestRatePercentage/12), termMonths, totalAmountFinanced, (residualValue * -1), 0) * -1), 2);
            var financePaymentPerYear = (financePayment * 12);

            var fuelRate = carTypes[carType].fuelRate;
            var fuelCentsPerLitre = fuelTypes[fuelType].centsPerLitre;
            var fuelBudgetPerYear = round(((fuelRate * 1.1 * (fuelCentsPerLitre/10000)) * kmsPerYear), 2);

            var maintenanceRate = carTypes[carType].maintenanceRate;
            var maintenancePerYear =   round((maintenanceRate * 1.3 / 100 * kmsPerYear), 2);

            var tyreCost = carTypes[carType].tyreCost;
            var tyresNeeded = 4 * rounddown(((kmsPerYear * (termMonths/12)) / 37500), 0);
            var tyreBudgetPerYear = round(((tyresNeeded * 1.3 * tyreCost) / ((kmsPerYear/12) * termMonths) * kmsPerYear), 2);
            var tyreBudgetTotal = (tyreBudgetPerYear/12) * termMonths;

            var carInsurance = carTypes[carType].insurance;

            var totalRunningCostsPerYear = (fuelBudgetPerYear + maintenancePerYear + tyreBudgetPerYear + vehicleRegistrationFee + carInsurance + annualManagementFee);
            var totalYearlyBudgetedAmountsExGST = (financePaymentPerYear + totalRunningCostsPerYear);

            var statutoryMethodPost = round((fbtCostBase * (20/100)), 2);
            var statutoryMethodPre = round((totalYearlyBudgetedAmountsExGST - statutoryMethodPost + (statutoryMethodPost/11)), 2);

            var evDiscount = 84916;
            var operatingCostMethodPost = ((totalYearlyBudgetedAmountsExGST * (1 - (businessUse/100))) * 1.1);
            $('#evdText').hide();
            if ( (fuelType == 3 || fuelType == 4) && driveAwaySubTotalExGST < evDiscount ) {
                $('#evdText').show();
                operatingCostMethodPost = 0;
            }
            else if ( businessUse == 0 ) {
                operatingCostMethodPost = totalYearlyBudgetedAmountsExGST * 1.1
            }
            var operatingCostMethodPre = round((totalYearlyBudgetedAmountsExGST - (operatingCostMethodPost - (operatingCostMethodPost/11))), 2);

            var taxableSalaryStatutoryMethod = grossSalary - statutoryMethodPre;
            var taxableSalaryOperatingCost = grossSalary - operatingCostMethodPre;
            var incomeTaxData = getIncomeTaxData(grossSalary, taxableSalaryStatutoryMethod, taxableSalaryOperatingCost);

            var medicareLevyThreshold = 22801;
            var medicareLevyRate = parseFloat(2/100);

            // Without packaging - Income Tax
            var taxPaidExOffsetWithoutPackaging = incomeTaxData.withoutPackaging;
            var medicareRebateWithoutPackaging = ( grossSalary > medicareLevyThreshold ? (grossSalary * medicareLevyRate) : 0 );
            var totalTaxPaidWithoutPackaging = (taxPaidExOffsetWithoutPackaging + medicareRebateWithoutPackaging);
            var netIncomeWithoutPackaging = (grossSalary - totalTaxPaidWithoutPackaging);
            // Without packaging
            var preTaxDeductionWithoutPackaging = 0;
            var taxableSalaryWithoutPackaging = (grossSalary - preTaxDeductionWithoutPackaging);
            var incomeTaxWithoutPackaging = totalTaxPaidWithoutPackaging;
            var postTaxDeductionWithoutPackaging = 0;
            var annualTakeHomePayWithoutPackaging = taxableSalaryWithoutPackaging - incomeTaxWithoutPackaging - postTaxDeductionWithoutPackaging;
            var annualNetCostWithoutPackaging = operatingCostMethodPre + operatingCostMethodPost;
            var weeklyNetIncomeWithoutPackaging = round((annualTakeHomePayWithoutPackaging / numWeeksInYear), 2);
            var weeklyNetCostWithoutPackaging = round((annualNetCostWithoutPackaging / numWeeksInYear), 2);

            // Statutory Method - Income tax
            var taxableIncomeStatutoryMethod = grossSalary - statutoryMethodPre;
            var taxPaidExOffsetStatutoryMethod = incomeTaxData.sfm;
            var medicareRebateStatutoryMethod = round((taxableIncomeStatutoryMethod > medicareLevyThreshold ? (taxableIncomeStatutoryMethod * medicareLevyRate) : 0), 2);
            var totalTaxPaidStatutoryMethod = round((taxPaidExOffsetStatutoryMethod + medicareRebateStatutoryMethod), 2);
            var netIncomeStatutoryMethod = round((taxableIncomeStatutoryMethod - totalTaxPaidStatutoryMethod), 2);
            // Statutory Method
            var preTaxDeductionStatutoryMethod = statutoryMethodPre;
            var taxableSalaryStatutoryMethod = (grossSalary - preTaxDeductionStatutoryMethod);
            var incomeTaxStatutoryMethod = totalTaxPaidStatutoryMethod;
            var postTaxDeductionStatutoryMethod = statutoryMethodPost;
            var annualTakeHomePayStatutoryMethod = round((taxableSalaryStatutoryMethod - incomeTaxStatutoryMethod - postTaxDeductionStatutoryMethod), 2);
            var annualNetCostStatutoryMethod = round((annualTakeHomePayWithoutPackaging - annualTakeHomePayStatutoryMethod), 2);
            var weeklyNetIncomeStatutoryMethod = round((annualTakeHomePayStatutoryMethod / numWeeksInYear), 2);
            var weeklyNetCostStatutoryMethod = round((annualNetCostStatutoryMethod / numWeeksInYear), 2);
            // Statutory Method - Savings
            var carGstExRvGstStatutoryMethod = claimableGST;

            var runningCostGstStatutoryMethod = round((((totalYearlyBudgetedAmountsExGST / 12) * 0.1) - ((statutoryMethodPost / 12) / 11)), 2) * termMonths;
            var totalGstSavingsStatutoryMethod = carGstExRvGstStatutoryMethod + runningCostGstStatutoryMethod;
            var incomeTaxLessGstOnECMStatutoryMethod = round((((incomeTaxWithoutPackaging - incomeTaxStatutoryMethod)/12) * termMonths), 2);
            var totalSavingsStatutoryMethod = totalGstSavingsStatutoryMethod + incomeTaxLessGstOnECMStatutoryMethod;

            // Operating Cost Method - Income Tax
            var taxableIncomeOpCostMethod = grossSalary - operatingCostMethodPre;
            var taxPaidExOffsetOpCostMethod = incomeTaxData.ocm;
            var medicareRebateOpCostMethod = round((taxableIncomeOpCostMethod > medicareLevyThreshold ? (taxableIncomeOpCostMethod * medicareLevyRate) : 0), 2);
            var totalTaxPaidOpCostMethod = round((taxPaidExOffsetOpCostMethod + medicareRebateOpCostMethod), 2);
            var netIncomeOpCostMethod = round((taxableIncomeOpCostMethod - totalTaxPaidOpCostMethod), 2);

            // Operating Cost Method
            var preTaxDeductionOpCostMethod = operatingCostMethodPre;
            var taxableSalaryOpCostMethod = round((grossSalary - preTaxDeductionOpCostMethod), 2);
            var incomeTaxOpCostMethod = totalTaxPaidOpCostMethod;
            var postTaxDeductionOpCostMethod = operatingCostMethodPost;
            var annualTakeHomePayOpCostMethod = round((taxableSalaryOpCostMethod - incomeTaxOpCostMethod - postTaxDeductionOpCostMethod), 2);
            var annualNetCostOpCostMethod = round((annualTakeHomePayWithoutPackaging - annualTakeHomePayOpCostMethod), 2);
            var weeklyNetIncomeOpCostMethod = round((annualTakeHomePayOpCostMethod / numWeeksInYear), 2);
            var weeklyNetCostOpCostMethod = round((annualNetCostOpCostMethod / numWeeksInYear), 2);

            // Operating Cost - Savings
            var carGstExRvGstOpCostMethod = claimableGST;
            var runningCostGstOpCostMethod = round((((totalYearlyBudgetedAmountsExGST / 12) * 0.1) - ((operatingCostMethodPost / 12) / 11)), 2) * termMonths;
            var totalGstSavingsOpCostMethod = round((carGstExRvGstOpCostMethod + runningCostGstOpCostMethod), 2);
            var incomeTaxLessGstOnECMOpCostMethod = ((incomeTaxWithoutPackaging - incomeTaxOpCostMethod)/12) * termMonths;
            var totalSavingsOpCostMethod = totalGstSavingsOpCostMethod + incomeTaxLessGstOnECMOpCostMethod;

            var weeklyCost = ( weeklyNetCostStatutoryMethod < weeklyNetCostOpCostMethod ? weeklyNetCostStatutoryMethod : weeklyNetCostOpCostMethod );
            weeklyCost = round(weeklyCost, 0);
            weeklyCost = '$' + weeklyCost.toLocaleString();
            $('#weeklyCost').text(weeklyCost);
            $('#weekly_net_cost').val(weeklyCost);

            var annualCost = ( annualNetCostStatutoryMethod < annualNetCostOpCostMethod ? annualNetCostStatutoryMethod : annualNetCostOpCostMethod );
            annualCost = round(annualCost, 0);
            annualCostString = '$' + annualCost.toLocaleString();
            $('#annualCost').text(annualCostString);

            var leaseTaxSavings = ( weeklyNetCostStatutoryMethod < weeklyNetCostOpCostMethod ? totalSavingsStatutoryMethod : totalSavingsOpCostMethod );
            leaseTaxSavingsString = round(leaseTaxSavings, 0);
            leaseTaxSavingsString = '$' + leaseTaxSavingsString.toLocaleString();
            $('#leaseTaxSavings').text(leaseTaxSavingsString);

            var lifeOfLeaseTaxSavings = round((weeklyNetCostStatutoryMethod < weeklyNetCostOpCostMethod ? totalSavingsStatutoryMethod: totalSavingsOpCostMethod), 0);
            lifeOfLeaseTaxSavingsString = '$' + lifeOfLeaseTaxSavings.toLocaleString();

            var yearlyTaxSavings = round(round((lifeOfLeaseTaxSavings/termMonths) * 12, 2), 0);
            var yearlyTaxSavings = (leaseTaxSavings / termMonths * 12);
            yearlyTaxSavings = round(yearlyTaxSavings, 0);
            yearlyTaxSavings = '$' + yearlyTaxSavings.toLocaleString();

            var estimateTaxSavings = 0;
            if ( netIncomeWithoutPackaging  < 0 )
            {
                estimateTaxSavings = (1 - (annualCost / totalYearlyBudgetedAmountsExGST)) * 100;
            }
            else
            {
                if ( 1 - (annualCost/totalYearlyBudgetedAmountsExGST) < 0 )
                {
                    estimateTaxSavings = 0;
                }
                else
                {
                    estimateTaxSavings = ((1 - (annualCost/totalYearlyBudgetedAmountsExGST)) + 0.1) * 100;
                }
            }

            var estimateTaxSavingsString = roundup(estimateTaxSavings, 0)
            estimateTaxSavingsString = estimateTaxSavingsString.toLocaleString() + '%';

            $('#yearlyTaxSavings').text(yearlyTaxSavings);
        }
        else {
            var parameters = '?';
            parameters += 'carType=' + carType;
            parameters += '&fuelType=' + fuelType;
            parameters += '&driveAwayPrice=' + driveAwayPrice;
            parameters += '&leaseTerm=' + leaseTerm;
            parameters += '&kmsPerYear=' + kmsPerYear;
            parameters += '&grossSalary=' + grossSalary;
            parameters += '&businessUse=' + businessUse;
            window.location = window.location.href = window.location.protocol + '//' + window.location.host + '/novated-lease-calculator-results' + parameters;
        }
    }
    calculateResults();
});

console.log("test");
