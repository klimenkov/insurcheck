import { FSA_RISK_MAP, VEHICLE_RISK_MAP } from './ontarioData.js';

/**
 * Evaluates an Ontario auto insurance premium against parametric benchmarks.
 */
export function evaluateInsurance(params) {
  const {
    vehicleMake,
    vehicleModel,
    vehicleYear,
    postalCode,
    driverAge,
    driverProfile, // 'young', 'experienced', 'senior'
    yearsLicensed,
    cleanRecord,    // boolean
    currentPremium  // monthly $
  } = params;

  // 1. Resolve Location Risk
  const cleanFSA = (postalCode || '').trim().toUpperCase().slice(0, 3);
  const locationInfo = FSA_RISK_MAP[cleanFSA] || {
    city: 'Ontario (General / GTA Fringe)',
    risk: 1.05,
    label: cleanFSA || 'Ontario Region'
  };

  // 2. Resolve Vehicle Risk Factor
  const vehicleKey = `${(vehicleMake || '').trim().toUpperCase()}_${(vehicleModel || '').trim().toUpperCase()}`;
  const vehicleInfo = VEHICLE_RISK_MAP[vehicleKey] || {
    factor: 1.00,
    category: 'Standard Passenger Vehicle',
    highTheft: false
  };

  // Vehicle age modifier (newer cars cost slightly more for collision, older for liability)
  const currentYear = 2026;
  const carAge = Math.max(0, currentYear - (parseInt(vehicleYear, 10) || 2020));
  let carAgeFactor = 1.0;
  if (carAge <= 2) carAgeFactor = 1.10;
  else if (carAge <= 6) carAgeFactor = 1.00;
  else if (carAge <= 12) carAgeFactor = 0.92;
  else carAgeFactor = 0.88;

  // 3. Driver Profile & Age Multiplier
  const age = parseInt(driverAge, 10) || 30;
  let ageFactor = 1.0;
  if (age < 20) ageFactor = 2.25;
  else if (age <= 24) ageFactor = 1.70;
  else if (age <= 29) ageFactor = 1.20;
  else if (age <= 55) ageFactor = 0.98;
  else if (age <= 69) ageFactor = 0.90;
  else ageFactor = 1.05;

  // Experience factor
  const exp = parseInt(yearsLicensed, 10) || 5;
  let expFactor = 1.0;
  if (exp < 1) expFactor = 1.45;
  else if (exp <= 2) expFactor = 1.25;
  else if (exp <= 5) expFactor = 1.08;
  else if (exp <= 10) expFactor = 0.95;
  else expFactor = 0.88;

  // 4. Record Multiplier
  const isClean = cleanRecord === true || cleanRecord === 'true' || cleanRecord === 1;
  const recordFactor = isClean ? 1.00 : 1.70;

  // Base Ontario monthly rate baseline (for neutral driver in neutral zone)
  const BASE_MONTHLY_ONTARIO = 175;

  // Calculated fair standard premium (Collision + Comprehensive + $1M Liability)
  const calculatedStandard = Math.round(
    BASE_MONTHLY_ONTARIO *
    locationInfo.risk *
    vehicleInfo.factor *
    carAgeFactor *
    ageFactor *
    expFactor *
    recordFactor
  );

  // Calculate 3 Coverage Tiers
  const minimumRate = Math.round(calculatedStandard * 0.72); // Basic Liability 1M only
  const standardRate = calculatedStandard;                   // Standard 1M + Collision + Comprehensive
  const comprehensiveRate = Math.round(calculatedStandard * 1.28); // Low deductible $500, Rental, Roadside

  // Sanity check comparison with user's current payment
  const current = parseFloat(currentPremium) || calculatedStandard;
  const monthlyDifference = Math.round(current - standardRate);
  const annualDifference = monthlyDifference * 12;

  let verdict = 'FAIR_RATE';
  let verdictTitle = 'Fair Market Price';
  let verdictMessage = 'Your current rate is aligned with the Ontario market average for your vehicle and location profile.';
  let verdictColor = 'emerald'; // green

  const ratio = current / standardRate;

  if (ratio >= 1.35) {
    verdict = 'SEVERE_OVERPAY';
    verdictTitle = 'Significant Overpayment!';
    verdictMessage = `You are paying ~${Math.round((ratio - 1) * 100)}% more than standard market benchmarks for Ontario.`;
    verdictColor = 'red';
  } else if (ratio >= 1.14) {
    verdict = 'OVERPAYING';
    verdictTitle = 'Higher Than Market Average';
    verdictMessage = 'You could likely save by shopping or negotiating prior to your policy renewal.';
    verdictColor = 'amber';
  } else if (ratio <= 0.85) {
    verdict = 'GREAT_DEAL';
    verdictTitle = 'Excellent Deal!';
    verdictMessage = 'Your current premium is well below Ontario regional averages. Keep this policy!';
    verdictColor = 'blue';
  }

  // Calculate Reliability / Confidence Score (0-100%)
  let reliability = 75;
  if (FSA_RISK_MAP[cleanFSA]) reliability += 15;
  if (VEHICLE_RISK_MAP[vehicleKey]) reliability += 10;
  reliability = Math.min(98, reliability);

  return {
    verdict,
    verdictTitle,
    verdictMessage,
    verdictColor,
    currentPremium: current,
    fairMonthlyStandard: standardRate,
    monthlySavings: Math.max(0, monthlyDifference),
    annualSavings: Math.max(0, annualDifference),
    overpayRatio: Math.round(ratio * 100) / 100,
    coverageTiers: {
      minimum: {
        name: 'Basic Liability (1M)',
        rate: minimumRate,
        description: 'Mandatory Ontario minimum + DCPD. No collision or comprehensive.'
      },
      standard: {
        name: 'Standard Package',
        rate: standardRate,
        description: 'Liability 1M + Collision & Comprehensive with $1,000 deductible.'
      },
      comprehensive: {
        name: 'Full Protection',
        rate: comprehensiveRate,
        description: 'Liability 2M, $500 deductible, Loss of Use (rental), and Roadside.'
      }
    },
    location: locationInfo,
    vehicle: {
      make: vehicleMake,
      model: vehicleModel,
      year: vehicleYear,
      ...vehicleInfo
    },
    reliabilityScore: reliability,
    riskHighlights: [
      locationInfo.risk > 1.25 ? `High postal code claim frequency in ${locationInfo.city}` : null,
      vehicleInfo.highTheft ? `${vehicleMake} ${vehicleModel} is on Équité Association's Ontario top-stolen list` : null,
      vehicleInfo.highRepairCost ? 'Higher specialized parts/sensor repair cost category' : null,
      age < 25 ? 'Young driver surcharge applies (graduated licensing tier)' : null
    ].filter(Boolean)
  };
}
