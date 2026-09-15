import { FSA_RISK_MAP, VEHICLE_RISK_MAP } from './ontarioData.js';

/**
 * Normalizes vehicle keys to match VEHICLE_RISK_MAP variations.
 */
function resolveVehicleInfo(make, model) {
  const rawMake = (make || '').trim().toUpperCase();
  const rawModel = (model || '').trim().toUpperCase();

  // Direct lookup
  let key = `${rawMake}_${rawModel}`;
  if (VEHICLE_RISK_MAP[key]) return VEHICLE_RISK_MAP[key];

  // Normalized key (strip spaces, hyphens)
  const normModel = rawModel.replace(/[\s\-_]/g, '');
  for (const [vKey, vData] of Object.entries(VEHICLE_RISK_MAP)) {
    const [dbMake, dbModel] = vKey.split('_');
    if (dbMake === rawMake) {
      const normDbModel = dbModel.replace(/[\s\-_]/g, '');
      if (normDbModel === normModel || normModel.includes(normDbModel) || normDbModel.includes(normModel)) {
        return vData;
      }
    }
  }

  // Fallback default
  return {
    factor: 1.00,
    category: 'Standard Passenger Vehicle',
    highTheft: false
  };
}

/**
 * Evaluates an Ontario auto insurance premium against actuarial benchmarks.
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

  // 1. Resolve Location Risk from FSRA Territorial Matrices
  const cleanFSA = (postalCode || '').trim().toUpperCase().slice(0, 3);
  const locationInfo = FSA_RISK_MAP[cleanFSA] || {
    city: 'Ontario (General / GTA Fringe)',
    risk: 1.05,
    label: cleanFSA || 'Ontario Region'
  };

  // 2. Resolve Vehicle Risk & Équité Theft Factor
  const vehicleInfo = resolveVehicleInfo(vehicleMake, vehicleModel);

  // Vehicle age modifier (newer cars cost more for collision/comprehensive, older for liability/DCPD)
  const currentYear = 2026;
  const carAge = Math.max(0, currentYear - (parseInt(vehicleYear, 10) || 2021));
  let carAgeFactor = 1.0;
  if (carAge <= 2) carAgeFactor = 1.12;
  else if (carAge <= 5) carAgeFactor = 1.02;
  else if (carAge <= 10) carAgeFactor = 0.94;
  else carAgeFactor = 0.88;

  // 3. Driver Profile & Age Multiplier (Graduated Licensing Actuarial Curve)
  const age = parseInt(driverAge, 10) || 30;
  let ageFactor = 1.0;
  if (age < 20) ageFactor = 2.35;
  else if (age <= 24) ageFactor = 1.75;
  else if (age <= 29) ageFactor = 1.22;
  else if (age <= 55) ageFactor = 0.98;
  else if (age <= 69) ageFactor = 0.90;
  else ageFactor = 1.06;

  // Experience factor
  const exp = parseInt(yearsLicensed, 10) || 5;
  let expFactor = 1.0;
  if (exp < 1) expFactor = 1.50;
  else if (exp <= 2) expFactor = 1.28;
  else if (exp <= 5) expFactor = 1.10;
  else if (exp <= 10) expFactor = 0.96;
  else expFactor = 0.88;

  // 4. Record Multiplier
  const isClean = cleanRecord === true || cleanRecord === 'true' || cleanRecord === 1;
  const recordFactor = isClean ? 1.00 : 1.75;

  // Base Ontario monthly rate baseline (for neutral G driver in neutral zone)
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
  const minimumRate = Math.round(calculatedStandard * 0.70); // Basic Liability 1M + DCPD
  const standardRate = calculatedStandard;                   // Standard 1M + Collision + Comprehensive ($1,000 deductible)
  const comprehensiveRate = Math.round(calculatedStandard * 1.30); // 2M Liability, $500 deductible, Rental, Roadside

  // Sanity check comparison with user's current payment
  const current = parseFloat(currentPremium) || calculatedStandard;
  const monthlyDifference = Math.round(current - standardRate);
  const annualDifference = monthlyDifference * 12;

  let verdict = 'FAIR_RATE';
  let verdictTitle = 'Fair Market Price';
  let verdictMessage = 'Your current rate is aligned with current Ontario market benchmarks for your vehicle and regional risk profile.';
  let verdictColor = 'emerald';

  const ratio = current / standardRate;

  if (ratio >= 1.35) {
    verdict = 'SEVERE_OVERPAY';
    verdictTitle = 'Significant Overpayment!';
    verdictMessage = `You are paying ~${Math.round((ratio - 1) * 100)}% more than standard market benchmarks for Ontario.`;
    verdictColor = 'red';
  } else if (ratio >= 1.14) {
    verdict = 'OVERPAYING';
    verdictTitle = 'Higher Than Market Average';
    verdictMessage = 'You could likely save substantially by shopping quotes prior to your next policy renewal.';
    verdictColor = 'amber';
  } else if (ratio <= 0.85) {
    verdict = 'GREAT_DEAL';
    verdictTitle = 'Excellent Deal!';
    verdictMessage = 'Your current premium is well below Ontario regional averages. Keep this policy active!';
    verdictColor = 'blue';
  }

  // Calculate Actuarial Confidence Score (0-100%)
  let reliability = 72;
  if (FSA_RISK_MAP[cleanFSA]) reliability += 16;
  if (vehicleInfo.factor !== 1.00) reliability += 10;
  reliability = Math.min(98, reliability);

  // Build risk highlights
  const riskHighlights = [];
  if (locationInfo.risk >= 1.35) {
    riskHighlights.push(`High postal code claim frequency in ${locationInfo.city} (${locationInfo.label}: +${Math.round((locationInfo.risk - 1) * 100)}% territory relativity)`);
  } else if (locationInfo.risk <= 0.85) {
    riskHighlights.push(`Favorable regional loss experience in ${locationInfo.city} (${Math.round((1 - locationInfo.risk) * 100)}% below Ontario average)`);
  }

  if (vehicleInfo.highTheft) {
    if (vehicleInfo.theftRank) {
      riskHighlights.push(`${vehicleMake} ${vehicleModel} is #${vehicleInfo.theftRank} most-stolen vehicle in Ontario (Équité Association index)`);
    } else {
      riskHighlights.push(`${vehicleMake} ${vehicleModel} carries high comprehensive theft surcharge in the GTA`);
    }
  }

  if (vehicleInfo.highRepairCost) {
    riskHighlights.push('Higher specialized parts and ADAS sensor calibration repair index');
  }

  if (age < 25) {
    riskHighlights.push('Young driver graduated licensing surcharge applies');
  }

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
        description: 'Liability 2M, $500 deductible, Loss of Use (rental car), and Roadside Assistance.'
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
    riskHighlights
  };
}
