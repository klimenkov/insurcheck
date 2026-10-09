/**
 * Insurer Suitability & Matching Algorithm (INS-66)
 * Calibrates driver profile, vehicle, territory, discounts, and underwriting appetite
 * across Ontario's Top 12 largest auto insurance providers.
 */

export const TOP_12_INSURERS = [
  {
    id: 'intact',
    name: 'Intact Insurance',
    marketShareRank: 1,
    annualRevenue: '$16.2B CAD',
    channel: 'Independent Broker Channel',
    channelType: 'broker',
    logoColor: '#e31b23',
    primaryStrength: 'Top Claims Settlement Speed & Network Breadth',
    pros: 'Largest Ontario network, guaranteed repair centers, strong claims forgiveness',
    website: 'https://www.intact.ca'
  },
  {
    id: 'desjardins',
    name: 'Desjardins Insurance',
    marketShareRank: 2,
    annualRevenue: '$7.4B CAD',
    channel: 'Direct Online, Phone & Exclusive Agents',
    channelType: 'direct',
    logoColor: '#00874e',
    primaryStrength: 'Best Telematics Savings (Ajusto up to 25%)',
    pros: 'Ajusto mobile tracking reward, bilingual claims support, strong home bundle discount',
    website: 'https://www.desjardinsgeneralinsurance.com'
  },
  {
    id: 'aviva',
    name: 'Aviva Canada',
    marketShareRank: 3,
    annualRevenue: '$6.8B CAD',
    channel: 'Independent Broker Channel',
    channelType: 'broker',
    logoColor: '#ffdd00',
    primaryStrength: 'Best for Multi-Vehicle & Commercial/Rideshare Coverage',
    pros: 'Lyft/rideshare endorsement, competitive multi-car discounts, strong broker access',
    website: 'https://www.aviva.ca'
  },
  {
    id: 'td',
    name: 'TD Insurance (Meloche Monnex)',
    marketShareRank: 4,
    annualRevenue: '$5.9B CAD',
    channel: 'Direct Digital & Phone Agency',
    channelType: 'direct',
    logoColor: '#008a00',
    primaryStrength: 'Best Alumni, University & Professional Association Rates',
    pros: 'Preferred rates for 750+ Canadian alumni & professional groups, banking bundle savings',
    website: 'https://www.tdinsurance.com'
  },
  {
    id: 'wawanesa',
    name: 'Wawanesa Insurance',
    marketShareRank: 5,
    annualRevenue: '$4.8B CAD',
    channel: 'Independent Insurance Brokers',
    channelType: 'broker',
    logoColor: '#004b87',
    primaryStrength: 'Best Value for Suburban & Established Driver Profiles',
    pros: 'Mutual insurer structure, low overhead, exceptional long-term policyholder retention',
    website: 'https://www.wawanesa.com'
  },
  {
    id: 'cooperators',
    name: 'Co-operators',
    marketShareRank: 6,
    annualRevenue: '$4.5B CAD',
    channel: 'Dedicated Financial Advisor Network',
    channelType: 'agent',
    logoColor: '#005a9c',
    primaryStrength: 'Dedicated Local Advisor & Family Multi-Policy Packaging',
    pros: 'Personal dedicated agent support, comprehensive family bundles, Canadian cooperative values',
    website: 'https://www.cooperators.ca'
  },
  {
    id: 'economical',
    name: 'Economical Insurance (Definity)',
    marketShareRank: 7,
    annualRevenue: '$4.4B CAD',
    channel: 'Independent Broker Channel',
    channelType: 'broker',
    logoColor: '#e02424',
    primaryStrength: 'Competitive Standard Market Rates via Ontario Brokers',
    pros: 'Backed by Definity Financial, broad standard vehicle appetite, solid multi-policy options',
    website: 'https://www.definityfinancial.com'
  },
  {
    id: 'belairdirect',
    name: 'Belairdirect',
    marketShareRank: 8,
    annualRevenue: '$4.2B CAD',
    channel: '100% Direct Online & Mobile App',
    channelType: 'direct',
    logoColor: '#005691',
    primaryStrength: 'Best 100% Digital Experience & Automerit App',
    pros: 'Instant quote and digital policy binding, Automerit driving discount, zero broker fees',
    website: 'https://www.belairdirect.com'
  },
  {
    id: 'travelers',
    name: 'Travelers Canada',
    marketShareRank: 9,
    annualRevenue: '$1.9B CAD',
    channel: 'Independent Broker Channel',
    channelType: 'broker',
    logoColor: '#e21836',
    primaryStrength: 'High-Value Property & Established Driver Package',
    pros: 'Top-tier home+auto combined policies, specialized coverage endorsements, established market reputation',
    website: 'https://www.travelerscanada.ca'
  },
  {
    id: 'allstate',
    name: 'Allstate Insurance',
    marketShareRank: 10,
    annualRevenue: '$1.6B CAD',
    channel: 'Local Agency Network & Direct Online',
    channelType: 'agent',
    logoColor: '#003882',
    primaryStrength: 'Drivewise Telematics & Local Agent Support',
    pros: 'Community agency branches, Drivewise app tracking rewards, Claim Forgiveness endorsement',
    website: 'https://www.allstate.ca'
  },
  {
    id: 'caa',
    name: 'CAA Insurance',
    marketShareRank: 11,
    annualRevenue: '$1.2B CAD',
    channel: 'Direct Online, Phone & Broker Channel',
    channelType: 'direct',
    logoColor: '#002f6c',
    primaryStrength: 'Best for Low-Mileage (CAA MyPace) & CAA Members',
    pros: 'Save up to 70% with CAA MyPace pay-per-km, 20% CAA member discount, top Ontario customer trust score',
    website: 'https://www.caainsurance.ca'
  },
  {
    id: 'goremutual',
    name: 'Gore Mutual',
    marketShareRank: 12,
    annualRevenue: '$720M CAD',
    channel: 'Independent Insurance Brokers',
    channelType: 'broker',
    logoColor: '#006241',
    primaryStrength: 'Community-Focused Mutual for Southwestern & Eastern Ontario',
    pros: 'Canada’s oldest property & casualty mutual, community focus, competitive rates outside the GTA core',
    website: 'https://www.goremutual.ca'
  }
];

/**
 * Calculates deterministic match scores and customized explanations for Ontario's Top 12 insurers.
 */
export function calculateInsurerMatches(driverData) {
  const {
    driverAge = 35,
    yearsLicensed = 10,
    cleanRecord = true,
    postalCode = '',
    locationInfo = {},
    vehicleMake = '',
    vehicleModel = '',
    vehicleYear = 2022,
    vehicleInfo = {},
    discounts = [],
    coverageLevel = 'Standard'
  } = driverData;

  const age = parseInt(driverAge, 10) || 35;
  const isClean = cleanRecord === true || cleanRecord === 'true' || cleanRecord === 1;
  const cleanFSA = (postalCode || '').trim().replace(/\s+/g, '').toUpperCase().slice(0, 3);
  const territoryRisk = locationInfo.risk || 1.05;
  const isHighTheftTerritory = territoryRisk >= 1.30;
  const isLowRiskTerritory = territoryRisk <= 1.05;
  const cityName = locationInfo.city || 'Ontario';
  const vMake = (vehicleMake || '').toUpperCase();
  const vModel = (vehicleModel || '').toUpperCase();
  const isEV = vMake.includes('TESLA') || vModel.includes('EV') || vModel.includes('E-TRON') || vModel.includes('IONIQ') || vModel.includes('BOLT');
  const isHighTheftVehicle = Boolean(vehicleInfo?.highTheft);
  const discountList = Array.isArray(discounts) ? discounts : [];

  const hasAppDiscount = discountList.includes('driving_app');
  const hasHomeBundle = discountList.includes('bundle_home');
  const hasMultiCar = discountList.includes('multi_vehicle');
  const hasWinterTires = discountList.includes('winter_tires');

  const matches = TOP_12_INSURERS.map((insurer) => {
    let score = 75; // Neutral baseline
    const reasons = [];

    switch (insurer.id) {
      case 'intact': {
        // Largest Canadian carrier, strong claims satisfaction, broad risk tolerance
        if (isHighTheftTerritory || isHighTheftVehicle) {
          score += 10;
          reasons.push(`Robust coverage and Tag tracking partnership for ${cityName} theft corridor`);
        }
        if (!isClean) {
          score += 8;
          reasons.push('Favorable Claims Forgiveness endorsement for drivers with prior marks');
        } else {
          score += 4;
        }
        if (age >= 25) {
          score += 5;
        }
        reasons.push('Broadest network of direct-repair facilities across Ontario');
        break;
      }

      case 'desjardins': {
        // Leader in telematics (Ajusto) and suburban coverage
        if (hasAppDiscount) {
          score += 14;
          reasons.push('Ajusto telematics program offers up to 25% discount based on mobile tracking');
        }
        if (isEV) {
          score += 8;
          reasons.push('Specialized green-vehicle savings for electric/hybrid models');
        }
        if (hasHomeBundle) {
          score += 7;
          reasons.push('High-rated combined property and auto discount');
        }
        if (isClean) score += 5;
        break;
      }

      case 'aviva': {
        // Excellent multi-vehicle and rideshare/commercial
        if (hasMultiCar) {
          score += 14;
          reasons.push('Strong multi-vehicle family policy discount across multiple drivers');
        }
        if (isHighTheftTerritory) {
          score += 6;
          reasons.push('Deep underwriting capacity in high-density GTA territories');
        }
        if (!isClean) {
          score += 7;
          reasons.push('Competitive rate tiering for drivers rebuilding clean record status');
        }
        reasons.push('Leading insurer endorsement for rideshare (Lyft/Uber) & delivery flex use');
        break;
      }

      case 'td': {
        // Great for professionals, university alumni, mature clean drivers
        if (age >= 26 && age <= 58 && isClean) {
          score += 13;
          reasons.push('Preferred group rates for university alumni and professional associations');
        }
        if (hasHomeBundle) {
          score += 8;
          reasons.push('Seamless direct multi-product discount with TD home insurance');
        }
        if (!isClean) {
          score -= 8;
        } else {
          score += 5;
          reasons.push('Clean driving record unlocks top TD Meloche tier');
        }
        if (age < 23) score -= 6;
        break;
      }

      case 'wawanesa': {
        // Mutual insurer, best outside intense theft epicenters, high loyalty
        if (isLowRiskTerritory) {
          score += 15;
          reasons.push(`Top-value mutual pricing in lower-loss territory (${cityName})`);
        } else if (isHighTheftTerritory) {
          score -= 5;
        }
        if (isClean && age >= 30) {
          score += 8;
          reasons.push('Exceptional long-term policyholder retention and mutual dividend benefits');
        }
        if (hasHomeBundle) {
          score += 6;
          reasons.push('Highly competitive mutual property+auto package');
        }
        break;
      }

      case 'cooperators': {
        // Dedicated local agents, family packages, high personal service
        if (hasHomeBundle || hasMultiCar) {
          score += 12;
          reasons.push('Substantial family bundle discount when combining home and multi-vehicle');
        }
        if (age >= 35) {
          score += 8;
          reasons.push('Dedicated community financial advisor dedicated to your policy review');
        }
        if (hasWinterTires) {
          score += 5;
          reasons.push('Generous seasonal tire safety credits');
        }
        break;
      }

      case 'economical': {
        // Broad broker market, standard vehicles
        score += 6;
        reasons.push('Broad underwriting tolerance for standard passenger vehicles via brokers');
        if (hasMultiCar) {
          score += 6;
          reasons.push('Competitive multi-vehicle household terms');
        }
        if (isClean) {
          score += 5;
          reasons.push('Standard preferred rating for convictions-free records');
        }
        break;
      }

      case 'belairdirect': {
        // 100% digital, young drivers, Automerit
        if (age < 30) {
          score += 14;
          reasons.push('Top digital platform for younger drivers seeking low upfront brokerless pricing');
        }
        if (hasAppDiscount) {
          score += 12;
          reasons.push('Automerit app tracks safe braking/speed for up to 15% rate reduction');
        }
        if (isClean) score += 4;
        reasons.push('Instant 100% online self-serve policy management without phone queues');
        break;
      }

      case 'travelers': {
        // Established drivers with valuable property
        if (age >= 35 && isClean) {
          score += 10;
          reasons.push('Top-rated underwriting for established homeowners with clean records');
        }
        if (hasHomeBundle) {
          score += 11;
          reasons.push('Industry-leading property+auto package endorsements');
        }
        if (isHighTheftTerritory) score -= 3;
        break;
      }

      case 'allstate': {
        // Drivewise telematics + community agents
        if (hasAppDiscount) {
          score += 12;
          reasons.push('Drivewise app provides immediate enrollment savings and driving rewards');
        }
        if (isClean) {
          score += 7;
          reasons.push('Claim Forgiveness and Disappearing Deductible options for safe drivers');
        }
        reasons.push('Local community agency branch network across Ontario');
        break;
      }

      case 'caa': {
        // Low mileage (MyPace), mature drivers, CAA members
        if (age >= 50) {
          score += 15;
          reasons.push('Top-ranked customer satisfaction and rates for mature/retiree drivers');
        }
        if (isLowRiskTerritory) {
          score += 10;
          reasons.push(`Superior rate stability in ${cityName}`);
        } else if (isHighTheftTerritory) {
          score -= 5;
        }
        if (hasWinterTires) {
          score += 6;
          reasons.push('Mandatory 5% + additional CAA member safety incentive');
        }
        if (!isClean) {
          score -= 8;
        } else {
          score += 6;
        }
        reasons.push('CAA MyPace program saves up to 70% for drivers under 9,000 km/year');
        break;
      }

      case 'goremutual': {
        // Southwestern/Eastern Ontario community mutual
        const isRegionalOntario = ['London', 'Kitchener', 'Waterloo', 'Cambridge', 'Guelph', 'Kingston', 'Ottawa'].some(c => cityName.includes(c));
        if (isRegionalOntario) {
          score += 16;
          reasons.push(`Ontario community mutual specializing in ${cityName} and surrounding areas`);
        } else if (isLowRiskTerritory) {
          score += 9;
          reasons.push('Competitive mutual pricing outside high-density Toronto corridors');
        }
        if (isClean) score += 5;
        reasons.push('Oldest Canadian mutual with personalized independent broker support');
        break;
      }

      default:
        break;
    }

    // Clamp score to realistic 62% - 98%
    const boundedScore = Math.min(98, Math.max(62, score));

    return {
      id: insurer.id,
      name: insurer.name,
      marketShareRank: insurer.marketShareRank,
      annualRevenue: insurer.annualRevenue,
      channel: insurer.channel,
      channelType: insurer.channelType,
      logoColor: insurer.logoColor,
      primaryStrength: insurer.primaryStrength,
      pros: insurer.pros,
      website: insurer.website,
      matchScore: boundedScore,
      matchReasons: reasons.slice(0, 3)
    };
  });

  // Sort descending by match score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Mark top matches
  const formatted = matches.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    isTopMatch: idx === 0,
    isFeatured: idx < 3
  }));

  return {
    topMatches: formatted.slice(0, 3),
    allMatches: formatted
  };
}
