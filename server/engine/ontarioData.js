/**
 * Comprehensive Ontario Auto Insurance Regional Risk Factors & Vehicle CLEAR Matrix
 * Calibrated against FSRA (Financial Services Regulatory Authority of Ontario)
 * territorial rate benchmarks and Équité Association auto theft indexes.
 */

// Regional risk multipliers for Ontario Forward Sortation Areas (FSAs)
// 1.00 = Ontario provincial baseline reference rate
export const FSA_RISK_MAP = {
  // === PEEL REGION: BRAMPTON (Historically Highest Territory in Ontario) ===
  'L6P': { city: 'Brampton', risk: 1.48, label: 'Brampton East / Goreway' },
  'L6R': { city: 'Brampton', risk: 1.44, label: 'Brampton North / Springdale' },
  'L6S': { city: 'Brampton', risk: 1.42, label: 'Brampton Central / Bramalea' },
  'L6T': { city: 'Brampton', risk: 1.40, label: 'Brampton South / Steeles' },
  'L6V': { city: 'Brampton', risk: 1.38, label: 'Brampton Central-West' },
  'L6W': { city: 'Brampton', risk: 1.37, label: 'Brampton Downtown / Peel Village' },
  'L6X': { city: 'Brampton', risk: 1.43, label: 'Brampton West / Fletcher\'s Meadow' },
  'L6Y': { city: 'Brampton', risk: 1.46, label: 'Brampton Southwest / Credit Valley' },
  'L6Z': { city: 'Brampton', risk: 1.41, label: 'Brampton Northwest / Heart Lake' },

  // === PEEL REGION: MISSISSAUGA & CALEDON ===
  'L4T': { city: 'Mississauga', risk: 1.36, label: 'Malton / Airport' },
  'L4V': { city: 'Mississauga', risk: 1.28, label: 'Northeast Mississauga' },
  'L4W': { city: 'Mississauga', risk: 1.24, label: 'Matheson / Dixie' },
  'L4X': { city: 'Mississauga', risk: 1.25, label: 'Applewood / Bloor' },
  'L4Y': { city: 'Mississauga', risk: 1.23, label: 'Dixie / Queensway' },
  'L4Z': { city: 'Mississauga', risk: 1.27, label: 'Rathwood / Square One East' },
  'L5A': { city: 'Mississauga', risk: 1.28, label: 'Mississauga Central / Cooksville East' },
  'L5B': { city: 'Mississauga', risk: 1.27, label: 'City Centre / Square One' },
  'L5C': { city: 'Mississauga', risk: 1.24, label: 'Creditview / Erindale' },
  'L5E': { city: 'Mississauga', risk: 1.18, label: 'Lakeview / Port Credit East' },
  'L5G': { city: 'Mississauga', risk: 1.16, label: 'Port Credit West' },
  'L5H': { city: 'Mississauga', risk: 1.14, label: 'Lorne Park / Clarkson North' },
  'L5J': { city: 'Mississauga', risk: 1.15, label: 'Clarkson / Southdown' },
  'L5K': { city: 'Mississauga', risk: 1.19, label: 'Sheridan / Erindale West' },
  'L5L': { city: 'Mississauga', risk: 1.21, label: 'Erin Mills / UTM' },
  'L5M': { city: 'Mississauga', risk: 1.23, label: 'Streetsville / Central Erin Mills' },
  'L5N': { city: 'Mississauga', risk: 1.25, label: 'Meadowvale / Lisgar' },
  'L5R': { city: 'Mississauga', risk: 1.27, label: 'Hurontario / Creditview' },
  'L5V': { city: 'Mississauga', risk: 1.26, label: 'East Credit / Britannia' },
  'L5W': { city: 'Mississauga', risk: 1.28, label: 'Meadowvale Village / Derry' },
  'L7C': { city: 'Caledon', risk: 1.12, label: 'Caledon / Bolton' },

  // === CITY OF TORONTO: SCARBOROUGH (High Claim Frequency) ===
  'M1B': { city: 'Toronto (Scarborough)', risk: 1.34, label: 'Malvern / Rouge River' },
  'M1C': { city: 'Toronto (Scarborough)', risk: 1.20, label: 'Highland Creek / Port Union' },
  'M1E': { city: 'Toronto (Scarborough)', risk: 1.22, label: 'Guildwood / West Hill' },
  'M1G': { city: 'Toronto (Scarborough)', risk: 1.26, label: 'Woburn' },
  'M1H': { city: 'Toronto (Scarborough)', risk: 1.24, label: 'Cedarbrae' },
  'M1J': { city: 'Toronto (Scarborough)', risk: 1.27, label: 'Scarborough Village' },
  'M1K': { city: 'Toronto (Scarborough)', risk: 1.28, label: 'Kennedy Park / Ionview' },
  'M1L': { city: 'Toronto (Scarborough)', risk: 1.25, label: 'Golden Mile / Clairlea' },
  'M1M': { city: 'Toronto (Scarborough)', risk: 1.18, label: 'Cliffcrest / Scarborough Bluffs' },
  'M1N': { city: 'Toronto (Scarborough)', risk: 1.16, label: 'Birch Cliff' },
  'M1P': { city: 'Toronto (Scarborough)', risk: 1.26, label: 'Dorset Park / Wexford Heights' },
  'M1R': { city: 'Toronto (Scarborough)', risk: 1.24, label: 'Maryvale / Wexford' },
  'M1S': { city: 'Toronto (Scarborough)', risk: 1.27, label: 'Agincourt South' },
  'M1T': { city: 'Toronto (Scarborough)', risk: 1.25, label: 'Clarks Corners / Sullivan' },
  'M1V': { city: 'Toronto (Scarborough)', risk: 1.29, label: 'Milliken / Agincourt North' },
  'M1W': { city: 'Toronto (Scarborough)', risk: 1.26, label: 'Steeles / L\'Amoreaux' },
  'M1X': { city: 'Toronto (Scarborough)', risk: 1.31, label: 'Upper Rouge / Steeles East' },

  // === CITY OF TORONTO: NORTH YORK & ETOBICOKE (Northwest Highway Corridors) ===
  'M3N': { city: 'Toronto (North York)', risk: 1.36, label: 'Jane and Finch / Black Creek' },
  'M3J': { city: 'Toronto (North York)', risk: 1.31, label: 'York University / Downsview' },
  'M3K': { city: 'Toronto (North York)', risk: 1.24, label: 'Downsview East' },
  'M3L': { city: 'Toronto (North York)', risk: 1.32, label: 'Downsview West' },
  'M3M': { city: 'Toronto (North York)', risk: 1.28, label: 'Downsview Central' },
  'M2M': { city: 'Toronto (North York)', risk: 1.19, label: 'Newtonbrook East' },
  'M2R': { city: 'Toronto (North York)', risk: 1.21, label: 'Willowdale West' },
  'M2N': { city: 'Toronto (North York)', risk: 1.16, label: 'Willowdale East / Yonge' },
  'M9V': { city: 'Toronto (Etobicoke)', risk: 1.35, label: 'Albion / Humber Summit' },
  'M9W': { city: 'Toronto (Etobicoke)', risk: 1.32, label: 'Etobicoke North / Rexdale' },
  'M9R': { city: 'Toronto (Etobicoke)', risk: 1.22, label: 'Kingsview Village / Martin Grove' },
  'M9B': { city: 'Toronto (Etobicoke)', risk: 1.18, label: 'West Deane Park / Princess Gardens' },
  'M9C': { city: 'Toronto (Etobicoke)', risk: 1.17, label: 'Markland Wood / Bloordale' },
  'M8V': { city: 'Toronto (Etobicoke)', risk: 1.14, label: 'Mimico / New Toronto' },
  'M8W': { city: 'Toronto (Etobicoke)', risk: 1.15, label: 'Alderwood / Long Branch' },

  // === CITY OF TORONTO: DOWNTOWN / MIDTOWN / EAST & WEST ===
  'M5V': { city: 'Toronto (Downtown)', risk: 1.11, label: 'Entertainment District / King West' },
  'M5J': { city: 'Toronto (Downtown)', risk: 1.12, label: 'Harbourfront / Union' },
  'M5H': { city: 'Toronto (Downtown)', risk: 1.10, label: 'Financial District' },
  'M5R': { city: 'Toronto (Midtown)', risk: 1.07, label: 'Yorkville / Annex' },
  'M4Y': { city: 'Toronto (Downtown)', risk: 1.09, label: 'Church and Wellesley' },
  'M4E': { city: 'Toronto (East)', risk: 1.04, label: 'The Beaches' },
  'M4C': { city: 'Toronto (East)', risk: 1.08, label: 'East York / Woodbine' },
  'M4G': { city: 'Toronto (Leaside)', risk: 1.01, label: 'Leaside / East York' },
  'M6H': { city: 'Toronto (West)', risk: 1.12, label: 'Dufferin / Dovercourt' },
  'M6P': { city: 'Toronto (West)', risk: 1.09, label: 'High Park / Junction' },
  'M6S': { city: 'Toronto (West)', risk: 1.05, label: 'Swansea / Bloor West' },

  // === YORK REGION: VAUGHAN, MARKHAM, RICHMOND HILL ===
  'L4L': { city: 'Vaughan', risk: 1.27, label: 'Woodbridge South' },
  'L4H': { city: 'Vaughan', risk: 1.26, label: 'Woodbridge North / Kleinburg' },
  'L4K': { city: 'Vaughan', risk: 1.23, label: 'Concord / Thornhill West' },
  'L4J': { city: 'Vaughan', risk: 1.20, label: 'Thornhill East' },
  'L6A': { city: 'Vaughan', risk: 1.24, label: 'Maple / Carrville' },
  'L3R': { city: 'Markham', risk: 1.17, label: 'Markham Central / Unionville' },
  'L3S': { city: 'Markham', risk: 1.21, label: 'Milliken Mills / Markham South' },
  'L3P': { city: 'Markham', risk: 1.15, label: 'Old Markham / Cornell' },
  'L6B': { city: 'Markham', risk: 1.16, label: 'Cornell East' },
  'L4B': { city: 'Richmond Hill', risk: 1.18, label: 'Richmond Hill South' },
  'L4C': { city: 'Richmond Hill', risk: 1.16, label: 'Richmond Hill Central' },
  'L4E': { city: 'Richmond Hill', risk: 1.14, label: 'Oak Ridges / Lake Wilcox' },
  'L3X': { city: 'Newmarket', risk: 1.06, label: 'Newmarket West' },
  'L3Y': { city: 'Newmarket', risk: 1.08, label: 'Newmarket East' },
  'L4G': { city: 'Aurora', risk: 1.05, label: 'Aurora Central' },

  // === HALTON REGION: OAKVILLE, BURLINGTON, MILTON ===
  'L6H': { city: 'Oakville', risk: 0.96, label: 'Oakville North / River Oaks' },
  'L6J': { city: 'Oakville', risk: 0.94, label: 'Oakville East' },
  'L6K': { city: 'Oakville', risk: 0.93, label: 'Oakville Central / West' },
  'L6M': { city: 'Oakville', risk: 0.95, label: 'Oakville West / Bronte' },
  'L7L': { city: 'Burlington', risk: 0.93, label: 'Burlington South' },
  'L7M': { city: 'Burlington', risk: 0.94, label: 'Burlington North' },
  'L7N': { city: 'Burlington', risk: 0.92, label: 'Burlington Central' },
  'L7T': { city: 'Burlington', risk: 0.91, label: 'Aldershot' },
  'L9T': { city: 'Milton', risk: 1.08, label: 'Milton Central' },
  'L9E': { city: 'Milton', risk: 1.09, label: 'Milton South' },

  // === DURHAM REGION: PICKERING, AJAX, WHITBY, OSHAWA ===
  'L1V': { city: 'Pickering', risk: 1.15, label: 'Pickering Southwest' },
  'L1X': { city: 'Pickering', risk: 1.16, label: 'Pickering North' },
  'L1S': { city: 'Ajax', risk: 1.18, label: 'Ajax South' },
  'L1T': { city: 'Ajax', risk: 1.20, label: 'Ajax North' },
  'L1Z': { city: 'Ajax', risk: 1.19, label: 'Ajax East' },
  'L1N': { city: 'Whitby', risk: 1.09, label: 'Whitby South' },
  'L1R': { city: 'Whitby', risk: 1.11, label: 'Whitby North' },
  'L1G': { city: 'Oshawa', risk: 1.08, label: 'Oshawa North' },
  'L1H': { city: 'Oshawa', risk: 1.10, label: 'Oshawa South' },

  // === HAMILTON & NIAGARA ===
  'L8P': { city: 'Hamilton', risk: 0.99, label: 'Hamilton Southwest' },
  'L8N': { city: 'Hamilton', risk: 1.03, label: 'Hamilton Downtown' },
  'L9A': { city: 'Hamilton', risk: 0.98, label: 'Hamilton Mountain West' },
  'L9B': { city: 'Hamilton', risk: 0.97, label: 'Hamilton Mountain South' },
  'L2N': { city: 'St. Catharines', risk: 0.89, label: 'St. Catharines North' },
  'L2R': { city: 'St. Catharines', risk: 0.92, label: 'St. Catharines Downtown' },
  'L2E': { city: 'Niagara Falls', risk: 0.93, label: 'Niagara Falls Central' },

  // === WATERLOO REGION & GUELPH ===
  'N2L': { city: 'Waterloo', risk: 0.88, label: 'Waterloo University / North' },
  'N2T': { city: 'Waterloo', risk: 0.86, label: 'Waterloo West' },
  'N2A': { city: 'Kitchener', risk: 0.91, label: 'Kitchener East' },
  'N2E': { city: 'Kitchener', risk: 0.92, label: 'Kitchener Southwest' },
  'N2H': { city: 'Kitchener', risk: 0.90, label: 'Kitchener Downtown' },
  'N1R': { city: 'Cambridge', risk: 0.90, label: 'Cambridge Central' },
  'N1E': { city: 'Guelph', risk: 0.86, label: 'Guelph North' },
  'N1G': { city: 'Guelph', risk: 0.85, label: 'Guelph South' },

  // === SOUTHWESTERN ONTARIO: LONDON & WINDSOR ===
  'N6A': { city: 'London', risk: 0.88, label: 'London Downtown / UWO' },
  'N6C': { city: 'London', risk: 0.87, label: 'London South' },
  'N6E': { city: 'London', risk: 0.89, label: 'London Southeast' },
  'N6G': { city: 'London', risk: 0.86, label: 'London Northwest' },
  'N9A': { city: 'Windsor', risk: 0.96, label: 'Windsor Downtown' },
  'N8W': { city: 'Windsor', risk: 0.94, label: 'Windsor East' },
  'N9E': { city: 'Windsor', risk: 0.92, label: 'Windsor South' },

  // === EASTERN ONTARIO & OTTAWA (Lowest Major Rates in Ontario) ===
  'K1P': { city: 'Ottawa', risk: 0.77, label: 'Ottawa Downtown / Parliament' },
  'K1N': { city: 'Ottawa', risk: 0.79, label: 'Sandy Hill / ByWard' },
  'K2P': { city: 'Ottawa', risk: 0.78, label: 'Centretown / Glebe' },
  'K1S': { city: 'Ottawa', risk: 0.77, label: 'Ottawa South / Carleton' },
  'K2A': { city: 'Ottawa', risk: 0.76, label: 'Westboro / Hampton' },
  'K2G': { city: 'Ottawa', risk: 0.75, label: 'Nepean / Barrhaven North' },
  'K2J': { city: 'Ottawa', risk: 0.74, label: 'Barrhaven South' },
  'K2M': { city: 'Ottawa', risk: 0.73, label: 'Kanata South' },
  'K4A': { city: 'Ottawa', risk: 0.74, label: 'Orleans South' },
  'K7L': { city: 'Kingston', risk: 0.78, label: 'Kingston Downtown / Queen\'s' },

  // === CENTRAL & NORTHERN ONTARIO ===
  'L4M': { city: 'Barrie', risk: 0.96, label: 'Barrie North' },
  'L4N': { city: 'Barrie', risk: 0.98, label: 'Barrie South' },
  'P3A': { city: 'Sudbury', risk: 0.84, label: 'Sudbury Central' },
  'P7B': { city: 'Thunder Bay', risk: 0.82, label: 'Thunder Bay North' }
};

// Vehicle Risk & Équité Association Theft / CLEAR Loss Factors
// Baseline 1.00 = standard low-loss passenger automobile
export const VEHICLE_RISK_MAP = {
  // === TOP THEFT TARGETS IN ONTARIO (Équité Association 2024-2026 Rankings) ===
  'LEXUS_RX350': { factor: 1.58, category: 'Luxury SUV', highTheft: true, theftRank: 1 },
  'LEXUS_RX 350': { factor: 1.58, category: 'Luxury SUV', highTheft: true, theftRank: 1 },
  'LEXUS_RX450H': { factor: 1.62, category: 'Luxury Hybrid SUV', highTheft: true, theftRank: 1 },
  'LEXUS_NX300': { factor: 1.44, category: 'Compact Luxury SUV', highTheft: true, theftRank: 8 },
  'LEXUS_GX460': { factor: 1.55, category: 'Full-Size Luxury SUV', highTheft: true },
  
  'TOYOTA_HIGHLANDER': { factor: 1.54, category: 'Midsize SUV', highTheft: true, theftRank: 2 },
  'HONDA_CR-V': { factor: 1.50, category: 'Compact SUV', highTheft: true, theftRank: 3 },
  'HONDA_CRV': { factor: 1.50, category: 'Compact SUV', highTheft: true, theftRank: 3 },
  'LAND ROVER_RANGE ROVER': { factor: 1.68, category: 'Ultra-Luxury SUV', highTheft: true, theftRank: 4, highRepairCost: true },
  'LAND ROVER_RANGE ROVER SPORT': { factor: 1.66, category: 'Ultra-Luxury SUV', highTheft: true, theftRank: 4, highRepairCost: true },
  'LAND ROVER_DEFENDER': { factor: 1.56, category: 'Luxury SUV', highTheft: true, highRepairCost: true },
  
  'RAM_1500': { factor: 1.38, category: 'Full-Size Pickup', highTheft: true, theftRank: 5 },
  'DODGE_RAM 1500': { factor: 1.38, category: 'Full-Size Pickup', highTheft: true, theftRank: 5 },
  'FORD_F-150': { factor: 1.32, category: 'Full-Size Pickup', highTheft: true, theftRank: 6 },
  'JEEP_GRAND CHEROKEE': { factor: 1.42, category: 'Midsize SUV', highTheft: true, theftRank: 7 },
  'JEEP_WRANGLER': { factor: 1.36, category: 'Off-Road SUV', highTheft: true },
  'HONDA_CIVIC': { factor: 1.25, category: 'Compact Sedan', highTheft: false, theftRank: 9 },
  'HONDA_ACCORD': { factor: 1.22, category: 'Midsize Sedan', highTheft: false },
  'HONDA_PILOT': { factor: 1.28, category: 'Midsize 3-Row SUV', highTheft: true },
  
  'CHEVROLET_TAHOE': { factor: 1.44, category: 'Full-Size SUV', highTheft: true, theftRank: 10 },
  'CHEVROLET_SUBURBAN': { factor: 1.46, category: 'Full-Size SUV', highTheft: true },
  'GMC_YUKON': { factor: 1.45, category: 'Full-Size SUV', highTheft: true },
  'GMC_SIERRA': { factor: 1.30, category: 'Full-Size Pickup', highTheft: true },
  'CHEVROLET_SILVERADO': { factor: 1.28, category: 'Full-Size Pickup', highTheft: true },
  'ACURA_RDX': { factor: 1.36, category: 'Compact Luxury SUV', highTheft: true },
  'ACURA_MDX': { factor: 1.40, category: 'Midsize Luxury SUV', highTheft: true },

  // === HIGH POPULARITY COMMUTER CARS & SUVS ===
  'TOYOTA_RAV4': { factor: 1.15, category: 'Compact SUV', highTheft: false },
  'TOYOTA_COROLLA': { factor: 1.10, category: 'Compact Sedan', highTheft: false },
  'TOYOTA_CAMRY': { factor: 1.14, category: 'Midsize Sedan', highTheft: false },
  'HYUNDAI_ELANTRA': { factor: 1.04, category: 'Compact Sedan', highTheft: false },
  'HYUNDAI_TUCSON': { factor: 1.08, category: 'Compact SUV', highTheft: false },
  'HYUNDAI_SANTA FE': { factor: 1.12, category: 'Midsize SUV', highTheft: false },
  'KIA_FORTE': { factor: 1.02, category: 'Compact Sedan', highTheft: false },
  'KIA_SPORTAGE': { factor: 1.07, category: 'Compact SUV', highTheft: false },
  'KIA_TELLURIDE': { factor: 1.20, category: 'Midsize 3-Row SUV', highTheft: false },
  'MAZDA_CX-5': { factor: 0.98, category: 'Compact SUV', highTheft: false },
  'MAZDA_3': { factor: 0.95, category: 'Compact Sedan', highTheft: false },
  'MAZDA_CX-30': { factor: 0.97, category: 'Subcompact Crossover', highTheft: false },
  'MAZDA_CX-50': { factor: 1.02, category: 'Compact SUV', highTheft: false },
  'NISSAN_ROGUE': { factor: 1.06, category: 'Compact SUV', highTheft: false },
  'NISSAN_SENTRA': { factor: 1.02, category: 'Compact Sedan', highTheft: false },
  'FORD_ESCAPE': { factor: 1.04, category: 'Compact SUV', highTheft: false },
  'FORD_EXPLORER': { factor: 1.18, category: 'Midsize SUV', highTheft: false },

  // === ELECTRIC VEHICLES (High Repair / Structural Sensor Index) ===
  'TESLA_MODEL 3': { factor: 1.28, category: 'EV Sedan', highTheft: false, highRepairCost: true },
  'TESLA_MODEL Y': { factor: 1.34, category: 'EV SUV', highTheft: false, highRepairCost: true },
  'TESLA_MODEL S': { factor: 1.48, category: 'Luxury EV Sedan', highTheft: false, highRepairCost: true },
  'TESLA_MODEL X': { factor: 1.52, category: 'Luxury EV SUV', highTheft: false, highRepairCost: true },
  'HYUNDAI_IONIQ 5': { factor: 1.22, category: 'EV Crossover', highTheft: false, highRepairCost: true },
  'FORD_MUSTANG MACH-E': { factor: 1.26, category: 'EV SUV', highTheft: false, highRepairCost: true },

  // === EUROPEAN LUXURY (High Parts & Collision Cost) ===
  'BMW_3 SERIES': { factor: 1.32, category: 'Luxury Sedan', highTheft: false, highRepairCost: true },
  'BMW_5 SERIES': { factor: 1.40, category: 'Executive Sedan', highTheft: false, highRepairCost: true },
  'BMW_X3': { factor: 1.34, category: 'Luxury Compact SUV', highTheft: false, highRepairCost: true },
  'BMW_X5': { factor: 1.46, category: 'Luxury Midsize SUV', highTheft: false, highRepairCost: true },
  'AUDI_A4': { factor: 1.30, category: 'Luxury Sedan', highTheft: false, highRepairCost: true },
  'AUDI_Q5': { factor: 1.32, category: 'Luxury Compact SUV', highTheft: false, highRepairCost: true },
  'AUDI_Q7': { factor: 1.44, category: 'Luxury 3-Row SUV', highTheft: false, highRepairCost: true },
  'MERCEDES-BENZ_C-CLASS': { factor: 1.34, category: 'Luxury Sedan', highTheft: false, highRepairCost: true },
  'MERCEDES-BENZ_GLC': { factor: 1.36, category: 'Luxury Compact SUV', highTheft: false, highRepairCost: true },
  'MERCEDES-BENZ_GLE': { factor: 1.48, category: 'Luxury Midsize SUV', highTheft: false, highRepairCost: true },

  // === LOW THEFT / ACTUARIALLY ECONOMICAL MODELS ===
  'SUBARU_OUTBACK': { factor: 0.86, category: 'Wagon / Crossover', highTheft: false },
  'SUBARU_FORESTER': { factor: 0.87, category: 'Compact SUV', highTheft: false },
  'SUBARU_CROSSTREK': { factor: 0.89, category: 'Subcompact Crossover', highTheft: false },
  'VOLKSWAGEN_GOLF': { factor: 0.92, category: 'Hatchback', highTheft: false },
  'VOLKSWAGEN_JETTA': { factor: 0.94, category: 'Compact Sedan', highTheft: false },
  'VOLKSWAGEN_TIGUAN': { factor: 0.96, category: 'Compact SUV', highTheft: false },
  'TOYOTA_PRIUS': { factor: 0.93, category: 'Hybrid', highTheft: false },
  'VOLVO_XC60': { factor: 0.89, category: 'Luxury SUV', highTheft: false },
  'VOLVO_XC90': { factor: 0.94, category: 'Luxury 3-Row SUV', highTheft: false }
};

export const POPULAR_MAKES = [
  'Honda', 'Toyota', 'Ford', 'Lexus', 'Hyundai', 'Mazda', 'Subaru',
  'Tesla', 'RAM', 'Jeep', 'Chevrolet', 'GMC', 'Acura', 'Nissan',
  'Volkswagen', 'BMW', 'Audi', 'Mercedes-Benz', 'Kia', 'Volvo', 'Land Rover'
];
