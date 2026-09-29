/**
 * Comprehensive Canadian Market Vehicle Makes & Models
 * Audited against Transport Canada, Équité Association theft rankings, and Canadian Black Book.
 * Sorted Z–A (descending) case-insensitively, with models within each make also sorted Z–A.
 */
export const VEHICLE_OPTIONS = [
  {
    make: 'Volvo',
    models: ['XC90', 'XC60', 'XC40', 'V60', 'S60']
  },
  {
    make: 'Volkswagen',
    models: ['Tiguan', 'Taos', 'Jetta', 'ID.4', 'Golf', 'Atlas Cross Sport', 'Atlas']
  },
  {
    make: 'Toyota',
    models: ['Tundra', 'Tacoma', 'Sienna', 'RAV4', 'Prius', 'Highlander', 'Corolla Cross', 'Corolla', 'Camry', '4Runner']
  },
  {
    make: 'Tesla',
    models: ['Model Y', 'Model X', 'Model S', 'Model 3', 'Cybertruck']
  },
  {
    make: 'Subaru',
    models: ['Solterra', 'Outback', 'Legacy', 'Impreza', 'Forester', 'Crosstrek', 'BRZ', 'Ascent']
  },
  {
    make: 'Rivian',
    models: ['R1T', 'R1S']
  },
  {
    make: 'RAM',
    models: ['ProMaster', '3500', '2500', '1500 Classic', '1500']
  },
  {
    make: 'Porsche',
    models: ['Taycan', 'Panamera', 'Macan', 'Cayenne', '911', '718 Cayman']
  },
  {
    make: 'Polestar',
    models: ['Polestar 3', 'Polestar 2']
  },
  {
    make: 'Nissan',
    models: ['Z', 'Versa', 'Sentra', 'Rogue', 'Pathfinder', 'Murano', 'Kicks', 'Frontier', 'Altima', 'Ariya']
  },
  {
    make: 'Mitsubishi',
    models: ['RVR', 'Outlander PHEV', 'Outlander', 'Mirage', 'Eclipse Cross']
  },
  {
    make: 'MINI',
    models: ['Countryman', 'Cooper']
  },
  {
    make: 'Mercedes-Benz',
    models: ['S-Class', 'GLB', 'GLE', 'GLC', 'GLA', 'E-Class', 'CLA', 'C-Class', 'A-Class']
  },
  {
    make: 'Mazda',
    models: ['MX-5', 'CX-90', 'CX-70', 'CX-50', 'CX-5', 'CX-30', '3']
  },
  {
    make: 'Lincoln',
    models: ['Navigator', 'Nautilus', 'Corsair', 'Aviator']
  },
  {
    make: 'Lexus',
    models: ['TX', 'RX 450h', 'RX 350', 'NX 350', 'NX 300', 'IS 300', 'GX 460', 'ES 350']
  },
  {
    make: 'Land Rover',
    models: ['Range Rover Velar', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover', 'Discovery Sport', 'Discovery', 'Defender']
  },
  {
    make: 'Kia',
    models: ['Telluride', 'Sportage', 'Soul', 'Sorento', 'Seltos', 'Niro', 'K5', 'Forte', 'EV9', 'EV6', 'Carnival']
  },
  {
    make: 'Jeep',
    models: ['Wrangler', 'Renegade', 'Gladiator', 'Grand Cherokee', 'Compass', 'Cherokee']
  },
  {
    make: 'Jaguar',
    models: ['XF', 'I-Pace', 'F-Type', 'F-Pace', 'E-Pace']
  },
  {
    make: 'Infiniti',
    models: ['QX80', 'QX60', 'QX55', 'QX50', 'Q50']
  },
  {
    make: 'Hyundai',
    models: ['Venue', 'Tucson', 'Sonata', 'Santa Fe', 'Palisade', 'Kona', 'Ioniq 6', 'Ioniq 5', 'Elantra']
  },
  {
    make: 'Honda',
    models: ['Ridgeline', 'Pilot', 'Passport', 'Odyssey', 'HR-V', 'CR-V', 'Civic', 'Accord']
  },
  {
    make: 'GMC',
    models: ['Yukon XL', 'Yukon', 'Terrain', 'Sierra 2500', 'Sierra 1500', 'Canyon', 'Acadia']
  },
  {
    make: 'Genesis',
    models: ['GV80', 'GV70', 'GV60', 'G90', 'G80', 'G70']
  },
  {
    make: 'Ford',
    models: ['Ranger', 'Mustang Mach-E', 'Mustang', 'Maverick', 'F-250', 'F-150 Lightning', 'F-150', 'Explorer', 'Expedition', 'Escape', 'Bronco Sport', 'Bronco', 'Edge']
  },
  {
    make: 'Dodge',
    models: ['Hornet', 'Durango', 'Charger', 'Challenger']
  },
  {
    make: 'Chrysler',
    models: ['Pacifica', 'Grand Caravan', '300']
  },
  {
    make: 'Chevrolet',
    models: ['Trax', 'Trailblazer', 'Traverse', 'Tahoe', 'Suburban', 'Silverado 2500', 'Silverado 1500', 'Malibu', 'Equinox', 'Corvette', 'Colorado', 'Camaro', 'Blazer']
  },
  {
    make: 'Cadillac',
    models: ['XT6', 'XT5', 'XT4', 'Lyriq', 'Escalade', 'CT5', 'CT4']
  },
  {
    make: 'Buick',
    models: ['Envision', 'Encore GX', 'Enclave']
  },
  {
    make: 'BMW',
    models: ['Z4', 'X7', 'X5', 'X3', 'X1', 'iX', 'i4', '7 Series', '5 Series', '4 Series', '3 Series', '2 Series']
  },
  {
    make: 'Audi',
    models: ['TT', 'Q8', 'Q7', 'Q5', 'Q4 e-tron', 'Q3', 'e-tron GT', 'A6', 'A5', 'A4', 'A3']
  },
  {
    make: 'Alfa Romeo',
    models: ['Tonale', 'Stelvio', 'Giulia']
  },
  {
    make: 'Acura',
    models: ['TLX', 'RDX', 'MDX', 'Integra']
  }
];

export const POPULAR_FSAS = [
  { fsa: 'M4G', city: 'Toronto (Leaside)', note: 'Moderate / Standard Territory' },
  { fsa: 'L6P', city: 'Brampton (East)', note: 'High Risk Territory' },
  { fsa: 'L6Y', city: 'Brampton (Southwest)', note: 'High Risk Territory' },
  { fsa: 'L4T', city: 'Mississauga (Malton)', note: 'High Risk Territory' },
  { fsa: 'L5M', city: 'Mississauga (Streetsville)', note: 'Elevated Risk' },
  { fsa: 'M3N', city: 'Toronto (North York / Jane & Finch)', note: 'High Risk' },
  { fsa: 'M1B', city: 'Toronto (Scarborough / Malvern)', note: 'Elevated Risk' },
  { fsa: 'M9W', city: 'Toronto (Etobicoke North)', note: 'Elevated Risk' },
  { fsa: 'M5V', city: 'Toronto (Downtown / King W)', note: 'Moderate Risk' },
  { fsa: 'M5R', city: 'Toronto (Midtown / Yorkville)', note: 'Moderate Risk' },
  { fsa: 'L4L', city: 'Vaughan (Woodbridge)', note: 'Elevated Risk' },
  { fsa: 'L3R', city: 'Markham (Unionville)', note: 'Moderate Risk' },
  { fsa: 'L4B', city: 'Richmond Hill', note: 'Moderate Risk' },
  { fsa: 'L1T', city: 'Ajax (North)', note: 'Elevated Risk' },
  { fsa: 'L6H', city: 'Oakville (North)', note: 'Favorable Risk' },
  { fsa: 'L7L', city: 'Burlington (South)', note: 'Favorable Risk' },
  { fsa: 'L8P', city: 'Hamilton (Southwest)', note: 'Moderate Risk' },
  { fsa: 'N2L', city: 'Waterloo (University)', note: 'Low Risk' },
  { fsa: 'N6A', city: 'London (Downtown)', note: 'Low Risk' },
  { fsa: 'K1P', city: 'Ottawa (Downtown)', note: 'Lowest Risk' }
];
