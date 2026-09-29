/**
 * Comprehensive Canadian Market Vehicle Makes & Models
 * Audited against Transport Canada, Équité Association theft rankings, and Canadian Black Book.
 * Sorted A–Z (ascending) case-insensitively, with models within each make also sorted A–Z.
 */
export const VEHICLE_OPTIONS = [
  {
    make: 'Acura',
    models: ['Integra', 'MDX', 'RDX', 'TLX']
  },
  {
    make: 'Alfa Romeo',
    models: ['Giulia', 'Stelvio', 'Tonale']
  },
  {
    make: 'Audi',
    models: ['A3', 'A4', 'A5', 'A6', 'e-tron GT', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'TT']
  },
  {
    make: 'BMW',
    models: ['2 Series', '3 Series', '4 Series', '5 Series', '7 Series', 'i4', 'iX', 'X1', 'X3', 'X5', 'X7', 'Z4']
  },
  {
    make: 'Buick',
    models: ['Enclave', 'Encore GX', 'Envision']
  },
  {
    make: 'Cadillac',
    models: ['CT4', 'CT5', 'Escalade', 'Lyriq', 'XT4', 'XT5', 'XT6']
  },
  {
    make: 'Chevrolet',
    models: ['Blazer', 'Camaro', 'Colorado', 'Corvette', 'Equinox', 'Malibu', 'Silverado 1500', 'Silverado 2500', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse', 'Trax']
  },
  {
    make: 'Chrysler',
    models: ['300', 'Grand Caravan', 'Pacifica']
  },
  {
    make: 'Dodge',
    models: ['Challenger', 'Charger', 'Durango', 'Hornet']
  },
  {
    make: 'Ford',
    models: ['Bronco', 'Bronco Sport', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'F-150 Lightning', 'F-250', 'Maverick', 'Mustang', 'Mustang Mach-E', 'Ranger']
  },
  {
    make: 'Genesis',
    models: ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80']
  },
  {
    make: 'GMC',
    models: ['Acadia', 'Canyon', 'Sierra 1500', 'Sierra 2500', 'Terrain', 'Yukon', 'Yukon XL']
  },
  {
    make: 'Honda',
    models: ['Accord', 'Civic', 'CR-V', 'HR-V', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline']
  },
  {
    make: 'Hyundai',
    models: ['Elantra', 'Ioniq 5', 'Ioniq 6', 'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson', 'Venue']
  },
  {
    make: 'Infiniti',
    models: ['Q50', 'QX50', 'QX55', 'QX60', 'QX80']
  },
  {
    make: 'Jaguar',
    models: ['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'XF']
  },
  {
    make: 'Jeep',
    models: ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Renegade', 'Wrangler']
  },
  {
    make: 'Kia',
    models: ['Carnival', 'EV6', 'EV9', 'Forte', 'K5', 'Niro', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Telluride']
  },
  {
    make: 'Land Rover',
    models: ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar']
  },
  {
    make: 'Lexus',
    models: ['ES 350', 'GX 460', 'IS 300', 'NX 300', 'NX 350', 'RX 350', 'RX 450h', 'TX']
  },
  {
    make: 'Lincoln',
    models: ['Aviator', 'Corsair', 'Nautilus', 'Navigator']
  },
  {
    make: 'Mazda',
    models: ['3', 'CX-30', 'CX-5', 'CX-50', 'CX-70', 'CX-90', 'MX-5']
  },
  {
    make: 'Mercedes-Benz',
    models: ['A-Class', 'C-Class', 'CLA', 'E-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'S-Class']
  },
  {
    make: 'MINI',
    models: ['Cooper', 'Countryman']
  },
  {
    make: 'Mitsubishi',
    models: ['Eclipse Cross', 'Mirage', 'Outlander', 'Outlander PHEV', 'RVR']
  },
  {
    make: 'Nissan',
    models: ['Altima', 'Ariya', 'Frontier', 'Kicks', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Versa', 'Z']
  },
  {
    make: 'Polestar',
    models: ['Polestar 2', 'Polestar 3']
  },
  {
    make: 'Porsche',
    models: ['718 Cayman', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan']
  },
  {
    make: 'RAM',
    models: ['1500', '1500 Classic', '2500', '3500', 'ProMaster']
  },
  {
    make: 'Rivian',
    models: ['R1S', 'R1T']
  },
  {
    make: 'Subaru',
    models: ['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'Solterra']
  },
  {
    make: 'Tesla',
    models: ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y']
  },
  {
    make: 'Toyota',
    models: ['4Runner', 'Camry', 'Corolla', 'Corolla Cross', 'Highlander', 'Prius', 'RAV4', 'Sienna', 'Tacoma', 'Tundra']
  },
  {
    make: 'Volkswagen',
    models: ['Atlas', 'Atlas Cross Sport', 'Golf', 'ID.4', 'Jetta', 'Taos', 'Tiguan']
  },
  {
    make: 'Volvo',
    models: ['S60', 'V60', 'XC40', 'XC60', 'XC90']
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
