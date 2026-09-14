// Regional risk multipliers for Ontario Forward Sortation Areas (FSAs)
export const FSA_RISK_MAP = {
  // Brampton - Highest in Ontario
  'L6P': { city: 'Brampton', risk: 1.45, label: 'Brampton East' },
  'L6R': { city: 'Brampton', risk: 1.42, label: 'Brampton North' },
  'L6S': { city: 'Brampton', risk: 1.40, label: 'Brampton Central' },
  'L6T': { city: 'Brampton', risk: 1.38, label: 'Brampton South' },
  'L6W': { city: 'Brampton', risk: 1.36, label: 'Brampton Downtown' },
  'L6X': { city: 'Brampton', risk: 1.42, label: 'Brampton West' },
  'L6Y': { city: 'Brampton', risk: 1.44, label: 'Brampton Southwest' },
  'L6Z': { city: 'Brampton', risk: 1.39, label: 'Brampton Northwest' },

  // Mississauga
  'L4T': { city: 'Mississauga', risk: 1.34, label: 'Malton' },
  'L5A': { city: 'Mississauga', risk: 1.26, label: 'Mississauga Central' },
  'L5B': { city: 'Mississauga', risk: 1.25, label: 'Cooksville' },
  'L5M': { city: 'Mississauga', risk: 1.22, label: 'Streetsville' },
  'L5N': { city: 'Mississauga', risk: 1.24, label: 'Meadowvale' },
  'L5R': { city: 'Mississauga', risk: 1.26, label: 'Hurontario' },

  // Toronto High Risk (North York / Scarborough / Etobicoke)
  'M1B': { city: 'Toronto (Scarborough)', risk: 1.32, label: 'Malvern / Rouge' },
  'M1X': { city: 'Toronto (Scarborough)', risk: 1.29, label: 'Upper Rouge' },
  'M9W': { city: 'Toronto (Etobicoke)', risk: 1.30, label: 'Etobicoke North' },
  'M9V': { city: 'Toronto (Etobicoke)', risk: 1.33, label: 'Albion / Humber Summit' },
  'M3N': { city: 'Toronto (North York)', risk: 1.35, label: 'Jane and Finch' },

  // Toronto Core / Midtown (Moderate)
  'M5V': { city: 'Toronto (Downtown)', risk: 1.10, label: 'Entertainment District / King West' },
  'M5R': { city: 'Toronto (Midtown)', risk: 1.08, label: 'Yorkville / Annex' },
  'M4Y': { city: 'Toronto (Downtown)', risk: 1.09, label: 'Church and Wellesley' },
  'M6H': { city: 'Toronto (West)', risk: 1.12, label: 'Dufferin / Dovercourt' },
  'M4C': { city: 'Toronto (East)', risk: 1.08, label: 'Woodbine Heights' },

  // York Region
  'L4L': { city: 'Vaughan', risk: 1.26, label: 'Woodbridge' },
  'L4K': { city: 'Vaughan', risk: 1.22, label: 'Concord' },
  'L4H': { city: 'Vaughan', risk: 1.25, label: 'Kleinburg / Woodbridge North' },
  'L3R': { city: 'Markham', risk: 1.16, label: 'Markham Central' },
  'L3P': { city: 'Markham', risk: 1.14, label: 'Markham East' },
  'L4B': { city: 'Richmond Hill', risk: 1.18, label: 'Richmond Hill South' },
  'L4C': { city: 'Richmond Hill', risk: 1.16, label: 'Richmond Hill Central' },

  // Halton Region & Hamilton
  'L6H': { city: 'Oakville', risk: 0.95, label: 'Oakville North' },
  'L6K': { city: 'Oakville', risk: 0.93, label: 'Oakville South' },
  'L7L': { city: 'Burlington', risk: 0.94, label: 'Burlington South' },
  'L8P': { city: 'Hamilton', risk: 0.98, label: 'Hamilton Southwest' },

  // Waterloo / Guelph
  'N2L': { city: 'Waterloo', risk: 0.88, label: 'Waterloo North' },
  'N1R': { city: 'Cambridge', risk: 0.90, label: 'Cambridge Central' },
  'N1E': { city: 'Guelph', risk: 0.86, label: 'Guelph North' },

  // Ottawa (Lowest major market in Ontario)
  'K1P': { city: 'Ottawa', risk: 0.78, label: 'Ottawa Downtown' },
  'K2P': { city: 'Ottawa', risk: 0.79, label: 'Centretown' },
  'K1N': { city: 'Ottawa', risk: 0.80, label: 'Sandy Hill' },
  'K2G': { city: 'Ottawa', risk: 0.76, label: 'Nepean' }
};

// Popular Ontario vehicles theft & claim risk factor
export const VEHICLE_RISK_MAP = {
  // High theft / target vehicles in Ontario
  'LEXUS_RX350': { factor: 1.48, category: 'Luxury SUV', highTheft: true },
  'HONDA_CR-V': { factor: 1.38, category: 'Compact SUV', highTheft: true },
  'TOYOTA_HIGHLANDER': { factor: 1.34, category: 'Midsize SUV', highTheft: true },
  'FORD_F-150': { factor: 1.28, category: 'Pickup Truck', highTheft: true },
  'HONDA_CIVIC': { factor: 1.22, category: 'Compact Sedan', highTheft: false },
  'RAM_1500': { factor: 1.26, category: 'Pickup Truck', highTheft: true },
  'JEEP_GRAND CHEROKEE': { factor: 1.30, category: 'Midsize SUV', highTheft: true },

  // Moderate risk / common vehicles
  'TOYOTA_RAV4': { factor: 1.12, category: 'Compact SUV', highTheft: false },
  'TOYOTA_COROLLA': { factor: 1.08, category: 'Compact Sedan', highTheft: false },
  'TESLA_MODEL 3': { factor: 1.26, category: 'EV Sedan', highTheft: false, highRepairCost: true },
  'TESLA_MODEL Y': { factor: 1.32, category: 'EV SUV', highTheft: false, highRepairCost: true },
  'HYUNDAI_ELANTRA': { factor: 1.02, category: 'Compact Sedan', highTheft: false },
  'HYUNDAI_TUCSON': { factor: 1.05, category: 'Compact SUV', highTheft: false },
  'MAZDA_CX-5': { factor: 0.98, category: 'Compact SUV', highTheft: false },
  'MAZDA_3': { factor: 0.94, category: 'Compact Sedan', highTheft: false },
  'NISSAN_ROGUE': { factor: 1.04, category: 'Compact SUV', highTheft: false },
  'CHEVROLET_SILVERADO': { factor: 1.22, category: 'Pickup Truck', highTheft: false },
  'BMW_3 SERIES': { factor: 1.30, category: 'Luxury Sedan', highTheft: false, highRepairCost: true },
  'AUDI_A4': { factor: 1.28, category: 'Luxury Sedan', highTheft: false, highRepairCost: true },
  'MERCEDES-BENZ_C-CLASS': { factor: 1.32, category: 'Luxury Sedan', highTheft: false, highRepairCost: true },

  // Low theft / economical vehicles
  'SUBARU_OUTBACK': { factor: 0.86, category: 'Wagon / Crossover', highTheft: false },
  'SUBARU_FORESTER': { factor: 0.88, category: 'Compact SUV', highTheft: false },
  'VOLKSWAGEN_GOLF': { factor: 0.92, category: 'Hatchback', highTheft: false },
  'VOLKSWAGEN_TIGUAN': { factor: 0.95, category: 'Compact SUV', highTheft: false },
  'TOYOTA_PRIUS': { factor: 0.94, category: 'Hybrid', highTheft: false },
  'VOLVO_XC60': { factor: 0.88, category: 'Luxury SUV', highTheft: false }
};

export const POPULAR_MAKES = [
  'Honda', 'Toyota', 'Ford', 'Hyundai', 'Mazda', 'Subaru', 'Lexus',
  'Nissan', 'Tesla', 'Volkswagen', 'Chevrolet', 'BMW', 'Audi', 'Mercedes-Benz'
];
