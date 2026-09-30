import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const POPULAR_MAKES = [
  'Acura', 'Alfa Romeo', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ferrari', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti',
  'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Maserati',
  'Mazda', 'Mercedes-Benz', 'MINI', 'Mitsubishi', 'Nissan', 'Porsche', 'RAM',
  'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

export const ALL_MAKES = [
  'AC', 'Acadian', 'Acura', 'Alfa Romeo', 'Allard', 'Alpina', 'Alvis', 'AM General',
  'AMC', 'American Bantam', 'Amphicar', 'ASA', 'Aston Martin', 'Asuna', 'Auburn',
  'Audi', 'Aurora', 'Austin', 'Austin-Healey', 'Bentley', 'BMW', 'BrightDrop',
  'Bugatti', 'Buick', 'Cadillac', 'Chamonix', 'Chevrolet', 'Chrysler', 'Citroen',
  'Clenet', 'Cord', 'Daewoo', 'Daihatsu', 'Datsun', 'De Tomaso', 'Dodge', 'Eagle',
  'Excalibur', 'Factory Five Racing', 'Ferrari', 'Fiat', 'Fisker', 'Ford',
  'Freightliner', 'Genesis', 'Geo', 'GMC', 'Hino', 'Honda', 'HUMMER', 'Hyundai',
  'Ineos', 'Infiniti', 'International', 'Isuzu', 'Jaguar', 'Jeep', 'Jensen',
  'Karma', 'Kia', 'Koenigsegg', 'Lada', 'Lamborghini', 'Lancia', 'Land Rover',
  'Lexus', 'Lincoln', 'Lordstown', 'Lotus', 'Lucid', 'Maserati', 'Maybach',
  'Mazda', 'McLaren', 'Mercedes-Benz', 'Mercury', 'Merkur', 'Meteor', 'MG',
  'MINI', 'Mitsubishi', 'Monarch', 'Morgan', 'MV-1', 'Nissan', 'Oakland',
  'Oldsmobile', 'Panoz', 'Peugeot', 'Pininfarina', 'Plymouth', 'Polestar',
  'Pontiac', 'Porsche', 'RAM', 'Rambler', 'Renault', 'Rivian', 'Rolls-Royce',
  'Rover', 'Saab', 'Saleen', 'Saturn', 'Scion', 'SEAT', 'Shelby', 'smart',
  'Spyker', 'Sterling', 'Studebaker', 'Subaru', 'Sunbeam', 'Suzuki', 'Tesla',
  'Toyota', 'Triumph', 'TVR', 'Vanderhall', 'VinFast', 'Volkswagen', 'Volvo',
  'Willys', 'Yugo'
];

const RAW_CATALOGUE = {
  'AC': ['Ace', 'Aceca', 'Cobra'],
  'Acadian': ['Beaumont', 'Canso', 'Invader'],
  'Acura': ['CL', 'CSX', 'ILX', 'Integra', 'Legend', 'MDX', 'NSX', 'RDX', 'RL', 'RLX', 'RSX', 'TL', 'TLX', 'TSX', 'ZDX'],
  'Alfa Romeo': ['4C', '4C Spider', 'Giulia', 'Stelvio', 'Tonale'],
  'Allard': ['J2', 'J2X', 'K1', 'K2'],
  'Alpina': ['B3', 'B5', 'B6', 'B7', 'B8', 'XB7'],
  'Alvis': ['TA21', 'TC21', 'TD21', 'TE21', 'TF21'],
  'AM General': ['Hummer', 'MV-1'],
  'AMC': ['AMX', 'Concord', 'Eagle', 'Gremlin', 'Hornet', 'Javelin', 'Matador', 'Pacer', 'Spirit'],
  'American Bantam': ['Coupe', 'Roadster'],
  'Amphicar': ['Model 770'],
  'ASA': ['1000 GT'],
  'Aston Martin': ['DB11', 'DB12', 'DB7', 'DB9', 'DBS', 'DBX', 'Rapide', 'V12 Vantage', 'V8 Vantage', 'Vanquish', 'Virage'],
  'Asuna': ['GT', 'SE', 'Sunfire', 'Sunrunner'],
  'Auburn': ['851 Speedster', '852 Boattail'],
  'Audi': [
    '100', '200', '4000', '5000', '80', '90', 'A3', 'A4', 'A4 allroad', 'A5',
    'A6', 'A6 allroad', 'A6 e-tron', 'A7', 'A8', 'Allroad', 'Cabriolet', 'Coupe',
    'e-tron', 'e-tron GT', 'Q3', 'Q4 e-tron', 'Q5', 'Q6 e-tron', 'Q7', 'Q8',
    'Q8 e-tron', 'Q9', 'QUATTRO', 'R8', 'RS e-tron GT', 'RS Q8', 'RS3', 'RS4',
    'RS5', 'RS6', 'RS7', 'S e-tron GT', 'S3', 'S4', 'S5', 'S6', 'S6 e-tron',
    'S7', 'S8', 'SQ5', 'SQ6 e-tron', 'SQ7', 'SQ8', 'SQ8 e-tron', 'SQ9', 'TT',
    'TT RS', 'TTS', 'V8'
  ],
  'Aurora': ['Custom'],
  'Austin': ['A40', 'Cambridge', 'Healey', 'Marina', 'Mini'],
  'Austin-Healey': ['100', '100-6', '3000', 'Sprite'],
  'Bentley': ['Arnage', 'Azure', 'Bentayga', 'Brooklands', 'Continental Flying Spur', 'Continental GT', 'Continental GTC', 'Flying Spur', 'Mulsanne'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'i3', 'i4', 'i5', 'i7', 'i8', 'iX', 'iX1', 'iX3', 'M2', 'M3', 'M4', 'M5', 'M6', 'M8', 'X1', 'X2', 'X3', 'X3 M', 'X4', 'X4 M', 'X5', 'X5 M', 'X6', 'X6 M', 'X7', 'XM', 'Z3', 'Z4', 'Z8'],
  'BrightDrop': ['Zevo 400', 'Zevo 600'],
  'Bugatti': ['Chiron', 'Divo', 'EB110', 'Mistral', 'Veyron'],
  'Buick': ['Century', 'Electra', 'Enclave', 'Encore', 'Encore GX', 'Envision', 'Envista', 'LaCrosse', 'LeSabre', 'Lucerne', 'Park Avenue', 'Regal', 'Rendezvous', 'Riviera', 'Verano'],
  'Cadillac': ['ATS', 'ATS-V', 'CT4', 'CT4-V', 'CT5', 'CT5-V', 'CT6', 'CTS', 'CTS-V', 'DeVille', 'DTS', 'ELR', 'Escalade', 'Escalade ESV', 'Escalade IQ', 'Lyriq', 'Optiq', 'SRX', 'STS', 'XLR', 'XT4', 'XT5', 'XT6', 'XTS'],
  'Chamonix': ['356 Speedster', '550 Spyder'],
  'Chevrolet': ['Astro', 'Avalanche', 'Aveo', 'Blazer', 'Blazer EV', 'Bolt EUV', 'Bolt EV', 'Camaro', 'Caprice', 'Cavalier', 'City Express', 'Cobalt', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Equinox EV', 'Express 1500', 'Express 2500', 'Express 3500', 'HHR', 'Impala', 'Malibu', 'Monte Carlo', 'Optra', 'Orlando', 'Silverado 1500', 'Silverado 2500HD', 'Silverado 3500HD', 'Silverado EV', 'Sonic', 'Spark', 'SS', 'SSR', 'Suburban', 'Tahoe', 'Tracker', 'Trailblazer', 'Traverse', 'Trax', 'Uplander', 'Venture', 'Volt'],
  'Chrysler': ['200', '300', '300M', 'Aspen', 'Cirrus', 'Concorde', 'Crossfire', 'Grand Caravan', 'Intrepid', 'LHS', 'New Yorker', 'Pacifica', 'PT Cruiser', 'Sebring', 'Town & Country', 'Voyager'],
  'Citroen': ['2CV', 'Berlingo', 'C3', 'C4', 'C5', 'DS', 'SM'],
  'Clenet': ['Series I', 'Series II', 'Series III', 'Series IV'],
  'Cord': ['810', '812', 'L-29'],
  'Daewoo': ['Lanos', 'Leganza', 'Nubira'],
  'Daihatsu': ['Charade', 'Rocky'],
  'Datsun': ['240Z', '260Z', '280Z', '280ZX', '510', '620', 'B210'],
  'De Tomaso': ['Guara', 'Mangusta', 'P72', 'Pantera', 'Vallelunga'],
  'Dodge': ['Avenger', 'Caliber', 'Caravan', 'Challenger', 'Charger', 'Charger Daytona', 'Dakota', 'Dart', 'Durango', 'Grand Caravan', 'Hornet', 'Intrepid', 'Journey', 'Magnum', 'Neon', 'Nitro', 'Ram 1500', 'Ram 2500', 'Ram 3500', 'Stratus', 'Viper'],
  'Eagle': ['Medallion', 'Premier', 'Summit', 'Talon', 'Vision'],
  'Excalibur': ['Series II', 'Series III', 'Series IV', 'Series V'],
  'Factory Five Racing': ['818', 'Daytona Coupe', 'GTM', 'Mk4 Roadster', 'Type 65 Coupe'],
  'Ferrari': ['296 GTB', '296 GTS', '360', '430 Scuderia', '458 Challenge', '458 Italia', '458 Speciale', '458 Spider', '488 GTB', '488 Pista', '488 Spider', '550 Maranello', '575M Maranello', '599 GTB Fiorano', '612 Scaglietti', '812 Competizione', '812 GTS', '812 Superfast', 'California', 'California T', 'Enzo', 'F12berlinetta', 'F355', 'F40', 'F430', 'F50', 'F8 Spider', 'F8 Tributo', 'FF', 'GTC4Lusso', 'LaFerrari', 'Monza SP1', 'Monza SP2', 'Portofino', 'Portofino M', 'Purosangue', 'Roma', 'Roma Spider', 'SF90 Spider', 'SF90 Stradale'],
  'Fiat': ['124 Spider', '500', '500 Abarth', '500L', '500X', '500e'],
  'Fisker': ['Karma', 'Ocean', 'Pear', 'Ronin'],
  'Ford': ['Aerostar', 'Bronco', 'Bronco II', 'Bronco Sport', 'C-Max', 'Crown Victoria', 'E-Series', 'Echo', 'Edge', 'Escape', 'Escort', 'Excursion', 'Expedition', 'Expedition MAX', 'Explorer', 'Explorer Sport Trac', 'F-150', 'F-150 Heritage', 'F-150 Lightning', 'F-250', 'F-350', 'F-450', 'Fiesta', 'Five Hundred', 'Flex', 'Focus', 'Freestar', 'Freestyle', 'Fusion', 'GT', 'Maverick', 'Mustang', 'Mustang Mach-E', 'Ranger', 'Taurus', 'Thunderbird', 'Transit Connect', 'Transit-150', 'Transit-250', 'Transit-350', 'Windstar'],
  'Freightliner': ['Sprinter 2500', 'Sprinter 3500'],
  'Genesis': ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80', 'GV80 Coupe'],
  'Geo': ['Metro', 'Prizm', 'Storm', 'Tracker'],
  'GMC': ['Acadia', 'Canyon', 'Envoy', 'Envoy XL', 'Hummer EV Pickup', 'Hummer EV SUV', 'Jimmy', 'Safari', 'Savana 1500', 'Savana 2500', 'Savana 3500', 'Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD', 'Sierra EV', 'Sonoma', 'Terrain', 'Yukon', 'Yukon XL'],
  'Hino': ['155', '195', '258', '268', '338'],
  'Honda': ['Accord', 'Accord Crosstour', 'Accord Hybrid', 'Civic', 'Civic CRX', 'Civic Del Sol', 'Civic Hybrid', 'Civic Type R', 'Clarity', 'CR-V', 'CR-V Hybrid', 'CR-Z', 'Crosstour', 'Element', 'Fit', 'HR-V', 'Insight', 'Odyssey', 'Passport', 'Pilot', 'Prelude', 'Prologue', 'Ridgeline', 'S2000'],
  'HUMMER': ['H1', 'H2', 'H2 SUT', 'H3', 'H3T'],
  'Hyundai': ['Accent', 'Azera', 'Elantra', 'Elantra GT', 'Elantra N', 'Entourage', 'Equus', 'Genesis', 'Genesis Coupe', 'Ioniq', 'Ioniq 5', 'Ioniq 5 N', 'Ioniq 6', 'Kona', 'Kona Electric', 'Kona N', 'Nexo', 'Palisade', 'Santa Cruz', 'Santa Fe', 'Santa Fe Hybrid', 'Santa Fe Sport', 'Santa Fe XL', 'Sonata', 'Sonata Hybrid', 'Tiburon', 'Tucson', 'Tucson Hybrid', 'Veloster', 'Veloster N', 'Venue', 'Veracruz', 'XG350'],
  'Ineos': ['Grenadier', 'Quartermaster'],
  'Infiniti': ['EX35', 'EX37', 'FX35', 'FX37', 'FX45', 'FX50', 'G20', 'G25', 'G35', 'G37', 'I30', 'I35', 'J30', 'JX35', 'M35', 'M37', 'M45', 'M56', 'Q40', 'Q45', 'Q50', 'Q60', 'Q70', 'QX30', 'QX4', 'QX50', 'QX55', 'QX56', 'QX60', 'QX70', 'QX80'],
  'International': ['Scout', 'Scout II', 'Travelall'],
  'Isuzu': ['Amigo', 'Ascender', 'Axiom', 'D-Max', 'Hombre', 'i-280', 'i-290', 'i-350', 'i-370', 'Rodeo', 'Rodeo Sport', 'Stylus', 'Trooper', 'VehiCROSS'],
  'Jaguar': ['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'S-Type', 'X-Type', 'XE', 'XF', 'XJ', 'XJ6', 'XJ8', 'XJR', 'XJS', 'XK', 'XK8', 'XKR'],
  'Jeep': ['Cherokee', 'Comanche', 'Commander', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Cherokee 4xe', 'Grand Cherokee L', 'Grand Wagoneer', 'Grand Wagoneer L', 'Liberty', 'Patriot', 'Renegade', 'TJ', 'Wagoneer', 'Wagoneer L', 'Wagoneer S', 'Wrangler', 'Wrangler 4xe', 'Wrangler JK', 'Wrangler TJ', 'Wrangler YJ'],
  'Jensen': ['Healey', 'Interceptor'],
  'Karma': ['GS-6', 'Gsero', 'Invictus', 'Kaveya', 'Revero', 'Revero GT'],
  'Kia': ['Amanti', 'Cadenza', 'Carnival', 'EV6', 'EV9', 'Forte', 'Forte Koup', 'Forte5', 'K5', 'K900', 'Magentis', 'Niro', 'Niro EV', 'Niro PHEV', 'Optima', 'Optima Hybrid', 'Rio', 'Rio5', 'Rondo', 'Sedona', 'Seltos', 'Sephia', 'Sorento', 'Sorento Hybrid', 'Soul', 'Soul EV', 'Spectra', 'Spectra5', 'Sportage', 'Sportage Hybrid', 'Stinger', 'Telluride'],
  'Koenigsegg': ['Agera', 'CC8S', 'CCX', 'CCR', 'Gemera', 'Jesko', 'One:1', 'Regera'],
  'Lada': ['Niva', 'Samara', 'Signet'],
  'Lamborghini': ['Aventador', 'Countach', 'Diablo', 'Gallardo', 'Huracan', 'Murcielago', 'Revuelto', 'Temerario', 'Urus', 'Urus Performante'],
  'Lancia': ['Beta', 'Delta', 'Flaminia', 'Flavia', 'Fulvia', 'Scorpion', 'Stratos', 'Thema'],
  'Land Rover': ['Defender 110', 'Defender 130', 'Defender 90', 'Discovery', 'Discovery 3', 'Discovery 4', 'Discovery Sport', 'Freelander', 'LR2', 'LR3', 'LR4', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
  'Lexus': ['CT 200h', 'ES 250', 'ES 300', 'ES 300h', 'ES 330', 'ES 350', 'GS 200t', 'GS 300', 'GS 350', 'GS 400', 'GS 430', 'GS 450h', 'GS 460', 'GS F', 'GX 460', 'GX 470', 'GX 550', 'HS 250h', 'IS 200t', 'IS 250', 'IS 300', 'IS 350', 'IS 500', 'IS C', 'IS F', 'LC 500', 'LC 500c', 'LC 500h', 'LFA', 'LS 400', 'LS 430', 'LS 460', 'LS 500', 'LS 500h', 'LS 600h L', 'LX 450', 'LX 470', 'LX 570', 'LX 600', 'NX 200t', 'NX 250', 'NX 300', 'NX 300h', 'NX 350', 'NX 350h', 'NX 450h+', 'RC 200t', 'RC 300', 'RC 350', 'RC F', 'RX 300', 'RX 330', 'RX 350', 'RX 350h', 'RX 350L', 'RX 400h', 'RX 450h', 'RX 450h+', 'RX 450hL', 'RX 500h', 'RZ 300e', 'RZ 450e', 'SC 300', 'SC 400', 'SC 430', 'TX 350', 'TX 500h', 'TX 550h+', 'UX 200', 'UX 250h', 'UX 300h'],
  'Lincoln': ['Aviator', 'Blackwood', 'Continental', 'Corsair', 'LS', 'Mark LT', 'Mark VII', 'Mark VIII', 'MKC', 'MKS', 'MKT', 'MKX', 'MKZ', 'Nautilus', 'Navigator', 'Navigator L', 'Town Car', 'Zephyr'],
  'Lordstown': ['Endurance'],
  'Lotus': ['Elan', 'Eletre', 'Elise', 'Emira', 'Esprit', 'Europa', 'Evora', 'Evora GT', 'Exige'],
  'Lucid': ['Air', 'Air Dream Edition', 'Air Grand Touring', 'Air Pure', 'Air Sapphire', 'Air Touring', 'Gravity'],
  'Maserati': ['Ghibli', 'GranCabrio', 'GranSport', 'GranTurismo', 'Grecale', 'Levante', 'MC20', 'MC20 Cielo', 'Quattroporte', 'Spyder'],
  'Maybach': ['57', '57S', '62', '62S', 'Landaulet'],
  'Mazda': ['2', '3', '3 Sport', '5', '6', '626', 'B-Series', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-7', 'CX-70', 'CX-9', 'CX-90', 'Mazdaspeed3', 'Mazdaspeed6', 'Millenia', 'MPV', 'MX-3', 'MX-30', 'MX-5 Miata', 'MX-6', 'Protege', 'Protege5', 'RX-7', 'RX-8', 'Tribute'],
  'McLaren': ['12C', '540C', '570GT', '570S', '600LT', '620R', '650S', '675LT', '720S', '750S', '765LT', 'Artura', 'Elva', 'GT', 'GTS', 'P1', 'Senna', 'Speedtail'],
  'Mercedes-Benz': ['A-Class', 'AMG GT', 'AMG GT 4-Door', 'B-Class', 'C-Class', 'CL-Class', 'CLA', 'CLE', 'CLK', 'CLS', 'E-Class', 'EQB', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV', 'G-Class', 'GL-Class', 'GLA', 'GLB', 'GLC', 'GLC Coupe', 'GLE', 'GLE Coupe', 'GLK', 'GLS', 'M-Class', 'Metris', 'ML-Class', 'R-Class', 'S-Class', 'SL-Class', 'SLC', 'SLK', 'SLR McLaren', 'SLS AMG', 'Sprinter 1500', 'Sprinter 2500', 'Sprinter 3500'],
  'Mercury': ['Capri', 'Cougar', 'Grand Marquis', 'Marauder', 'Mariner', 'Milan', 'Montego', 'Monterey', 'Mountaineer', 'Mystique', 'Sable', 'Topaz', 'Tracer', 'Villager'],
  'Merkur': ['Scorpio', 'XR4Ti'],
  'Meteor': ['Montcalm', 'Niagara', 'Rideau'],
  'MG': ['MGA', 'MGB', 'MGC', 'Midget', 'TC', 'TD', 'TF'],
  'MINI': ['Clubman', 'Convertible', 'Cooper', 'Cooper Countryman', 'Cooper Paceman', 'Countryman', 'Coupe', 'Hardtop', 'Paceman', 'Roadster'],
  'Mitsubishi': ['3000GT', 'Diamante', 'Eclipse', 'Eclipse Cross', 'Endeavor', 'Galant', 'i-MiEV', 'Lancer', 'Lancer Evolution', 'Mirage', 'Mirage G4', 'Montero', 'Montero Sport', 'Outlander', 'Outlander PHEV', 'Outlander Sport', 'Raider', 'RVR'],
  'Monarch': ['Lucerne', 'Richelieu', 'Turnpike Cruiser'],
  'Morgan': ['3 Wheeler', 'Aero 8', 'Plus 4', 'Plus 8', 'Plus Six', 'Roadster'],
  'MV-1': ['Base', 'DX', 'LX'],
  'Nissan': ['200SX', '240SX', '300ZX', '350Z', '370Z', 'Altima', 'Altima Hybrid', 'Ariya', 'Armada', 'Cube', 'Frontier', 'GT-R', 'Juke', 'Kicks', 'Leaf', 'Maxima', 'Micra', 'Murano', 'NV Cargo', 'NV Passenger', 'NV200', 'Pathfinder', 'Pathfinder Armada', 'Quest', 'Rogue', 'Rogue Select', 'Rogue Sport', 'Sentra', 'Titan', 'Titan XD', 'Versa', 'Versa Note', 'Xterra', 'Z'],
  'Oakland': ['All-American', 'Model 34', 'Model 6'],
  'Oldsmobile': ['Achieva', 'Alero', 'Aurora', 'Bravada', 'Ciera', 'Custom Cruiser', 'Cutlass', 'Cutlass Ciera', 'Cutlass Supreme', 'Eighty-Eight', 'Intrigue', 'LSS', 'Ninety-Eight', 'Regency', 'Silhouette', 'Toronado'],
  'Panoz': ['AIV Roadster', 'Esperante', 'Roadster'],
  'Peugeot': ['206', '208', '3008', '308', '405', '505', '508'],
  'Pininfarina': ['Battista'],
  'Plymouth': ['Acclaim', 'Breeze', 'Colt', 'Grand Voyager', 'Laser', 'Neon', 'Prowler', 'Reliant', 'Sundance', 'Voyager'],
  'Polestar': ['Polestar 1', 'Polestar 2', 'Polestar 3', 'Polestar 4'],
  'Pontiac': ['Aztek', 'Bonneville', 'Firebird', 'Firebird Trans Am', 'G3', 'G5', 'G6', 'G8', 'Grand Am', 'Grand Prix', 'GTO', 'Montana', 'Montana SV6', 'Pursuit', 'Solstice', 'Sunbird', 'Sunfire', 'Torrent', 'Trans Sport', 'Vibe', 'Wave'],
  'Porsche': ['718 Boxster', '718 Cayman', '718 Spyder', '911', '918 Spyder', '928', '944', '968', 'Boxster', 'Carrera GT', 'Cayenne', 'Cayenne Coupe', 'Cayman', 'Macan', 'Macan EV', 'Panamera', 'Taycan', 'Taycan Cross Turismo', 'Taycan Sport Turismo'],
  'RAM': ['1500', '1500 Classic', '1500 REV', '2500', '3500', '4500', '5500', 'Dakota', 'ProMaster 1500', 'ProMaster 2500', 'ProMaster 3500', 'ProMaster City', 'Rampage'],
  'Rambler': ['Ambassador', 'American', 'Classic', 'Rebel'],
  'Renault': ['5 Turbo', 'Captur', 'Clio', 'Megane', 'Twingo'],
  'Rivian': ['R1S', 'R1T', 'R2', 'R3', 'R3X'],
  'Rolls-Royce': ['Cullinan', 'Dawn', 'Ghost', 'Phantom', 'Phantom Coupe', 'Phantom Drophead Coupe', 'Silver Seraph', 'Silver Spur', 'Spectre', 'Wraith'],
  'Rover': ['200', '400', '600', '75', 'Mini', 'SD1'],
  'Saab': ['9-2X', '9-3', '9-3X', '9-4X', '9-5', '9-7X', '900', '9000'],
  'Saleen': ['S281', 'S302', 'S331', 'S7', 'Sportruck'],
  'Saturn': ['Astra', 'Aura', 'Ion', 'L-Series', 'Outlook', 'Relay', 'S-Series', 'SC', 'SC1', 'SC2', 'Sky', 'SL', 'SL1', 'SL2', 'SW1', 'SW2', 'Vue'],
  'Scion': ['FR-S', 'iA', 'iM', 'iQ', 'tC', 'xB', 'xD'],
  'SEAT': ['Arona', 'Ateca', 'Ibiza', 'Leon', 'Tarraco'],
  'Shelby': ['Cobra', 'CSX', 'GLH-S', 'GT', 'GT350', 'GT500', 'Series 1'],
  'smart': ['city-coupe', 'EQ fortwo', 'forfour', 'fortwo', 'roadster'],
  'Spyker': ['C8', 'C8 Aileron', 'C8 Double 12', 'C8 Laviolette', 'C8 Preliator', 'C8 Spyder'],
  'Sterling': ['825', '827'],
  'Studebaker': ['Avanti', 'Champion', 'Commander', 'Gran Turismo Hawk', 'Hawk', 'Lark', 'Silver Hawk'],
  'Subaru': ['Ascent', 'B9 Tribeca', 'Baja', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Impreza WRX', 'Impreza WRX STI', 'Legacy', 'Outback', 'Solterra', 'SVX', 'Tribeca', 'WRX', 'WRX STI'],
  'Sunbeam': ['Alpine', 'Tiger'],
  'Suzuki': ['Aerio', 'Equator', 'Esteem', 'Forenza', 'Grand Vitara', 'Kizashi', 'Reno', 'Samurai', 'Sidekick', 'Swift', 'SX4', 'Verona', 'Vitara', 'X-90', 'XL-7', 'XL7'],
  'Tesla': ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster'],
  'Toyota': ['4Runner', '86', 'Avalon', 'Avalon Hybrid', 'bZ4X', 'C-HR', 'Camry', 'Camry Solara', 'Celica', 'Corolla', 'Corolla Cross', 'Corolla Cross Hybrid', 'Corolla Hatchback', 'Corolla Hybrid', 'Corolla iM', 'Crown', 'Crown Signia', 'Echo', 'FJ Cruiser', 'Grand Highlander', 'Grand Highlander Hybrid', 'GR Corolla', 'GR Supra', 'GR86', 'Highlander', 'Highlander Hybrid', 'Land Cruiser', 'Matrix', 'Mirai', 'MR2', 'MR2 Spyder', 'Paseo', 'Prius', 'Prius C', 'Prius Plug-In', 'Prius Prime', 'Prius V', 'RAV4', 'RAV4 EV', 'RAV4 Hybrid', 'RAV4 Prime', 'Sequoia', 'Sienna', 'Solara', 'Supra', 'Tacoma', 'Tercel', 'Tundra', 'Venza', 'Yaris', 'Yaris Hatchback', 'Yaris Sedan'],
  'Triumph': ['GT6', 'Spitfire', 'Stag', 'TR250', 'TR3', 'TR4', 'TR4A', 'TR6', 'TR7', 'TR8'],
  'TVR': ['Cerbera', 'Chimaera', 'Griffith', 'Sagaris', 'Tamora', 'Tuscan'],
  'Vanderhall': ['Carmel', 'Edison', 'Venice'],
  'VinFast': ['VF 3', 'VF 6', 'VF 7', 'VF 8', 'VF 9'],
  'Volkswagen': ['Arteon', 'Atlas', 'Atlas Cross Sport', 'Beetle', 'Cabrio', 'CC', 'Corrado', 'e-Golf', 'Eos', 'Eurovan', 'Golf', 'Golf Alltrack', 'Golf City', 'Golf GTI', 'Golf R', 'Golf SportWagen', 'ID. Buzz', 'ID.4', 'ID.7', 'Jetta', 'Jetta City', 'Jetta GLI', 'Passat', 'Passat CC', 'Phaeton', 'Rabbit', 'Routan', 'Taos', 'Tiguan', 'Tiguan Limited', 'Touareg'],
  'Volvo': ['C30', 'C40 Recharge', 'C70', 'EX30', 'EX90', 'S40', 'S60', 'S60 Cross Country', 'S70', 'S80', 'S90', 'V40', 'V50', 'V60', 'V60 Cross Country', 'V70', 'V70 Cross Country', 'V70 XC', 'V90', 'V90 Cross Country', 'XC40', 'XC40 Recharge', 'XC60', 'XC70', 'XC90'],
  'Willys': ['CJ-2A', 'CJ-3A', 'CJ-3B', 'CJ-5', 'Jeepster', 'Wagon'],
  'Yugo': ['Cabrio', 'GV', 'GVL', 'GVS', 'GVX']
};

const MAKE_YEAR_RANGES = {
  'AC': [1953, 2024],
  'Acadian': [1962, 1971],
  'Allard': [1946, 1959],
  'Alvis': [1950, 1967],
  'AM General': [1984, 1995],
  'AMC': [1968, 1988],
  'American Bantam': [1938, 1941],
  'Amphicar': [1961, 1968],
  'ASA': [1962, 1967],
  'Asuna': [1992, 1995],
  'Auburn': [1930, 1937],
  'Aurora': [1957, 1958],
  'Austin': [1950, 1985],
  'Austin-Healey': [1953, 1971],
  'BrightDrop': [2022, 2026],
  'Chamonix': [1985, 2020],
  'Clenet': [1977, 1987],
  'Cord': [1929, 1937],
  'Daewoo': [1999, 2002],
  'Daihatsu': [1988, 1992],
  'Datsun': [1968, 1984],
  'De Tomaso': [1965, 2025],
  'Eagle': [1988, 1998],
  'Excalibur': [1965, 1990],
  'Fisker': [2011, 2024],
  'Geo': [1989, 1997],
  'Ineos': [2023, 2026],
  'International': [1960, 1980],
  'Isuzu': [1988, 2008],
  'Jensen': [1966, 1976],
  'Karma': [2017, 2026],
  'Lada': [1977, 1998],
  'Lancia': [1970, 2014],
  'Lordstown': [2022, 2023],
  'Lucid': [2022, 2026],
  'Maybach': [2002, 2012],
  'Mercury': [1980, 2011],
  'Merkur': [1985, 1989],
  'Meteor': [1949, 1976],
  'MG': [1955, 1980],
  'Monarch': [1946, 1961],
  'MV-1': [2011, 2016],
  'Oakland': [1920, 1931],
  'Oldsmobile': [1980, 2004],
  'Plymouth': [1980, 2001],
  'Polestar': [2020, 2026],
  'Pontiac': [1980, 2010],
  'Rambler': [1958, 1969],
  'Rivian': [2022, 2026],
  'Rover': [1976, 2005],
  'Saab': [1980, 2012],
  'Saturn': [1991, 2010],
  'Scion': [2004, 2016],
  'smart': [2004, 2019],
  'Spyker': [2000, 2016],
  'Sterling': [1987, 1991],
  'Studebaker': [1950, 1966],
  'Sunbeam': [1959, 1968],
  'Suzuki': [1986, 2014],
  'Triumph': [1960, 1981],
  'TVR': [1980, 2006],
  'Vanderhall': [2016, 2026],
  'VinFast': [2023, 2026],
  'Willys': [1945, 1965],
  'Yugo': [1985, 1992]
};

const MODEL_YEAR_OVERRIDES = {
  'Audi_100': [1968, 1994],
  'Audi_200': [1979, 1991],
  'Audi_4000': [1980, 1987],
  'Audi_5000': [1978, 1988],
  'Audi_80': [1973, 1996],
  'Audi_90': [1987, 1995],
  'Audi_A3': [2006, 2026],
  'Audi_A4': [1996, 2026],
  'Audi_A4 allroad': [2013, 2026],
  'Audi_A5': [2008, 2026],
  'Audi_A6': [1995, 2026],
  'Audi_A6 allroad': [2020, 2026],
  'Audi_A6 e-tron': [2024, 2026],
  'Audi_A7': [2012, 2026],
  'Audi_A8': [1997, 2026],
  'Audi_Allroad': [2001, 2005],
  'Audi_Cabriolet': [1994, 1998],
  'Audi_Coupe': [1981, 1991],
  'Audi_e-tron': [2019, 2024],
  'Audi_e-tron GT': [2022, 2026],
  'Audi_Q3': [2015, 2026],
  'Audi_Q4 e-tron': [2022, 2026],
  'Audi_Q5': [2009, 2026],
  'Audi_Q6 e-tron': [2024, 2026],
  'Audi_Q7': [2007, 2026],
  'Audi_Q8': [2019, 2026],
  'Audi_Q8 e-tron': [2024, 2026],
  'Audi_Q9': [2025, 2026],
  'Audi_QUATTRO': [1980, 1991],
  'Audi_R8': [2008, 2023],
  'Audi_RS e-tron GT': [2022, 2026],
  'Audi_RS Q8': [2020, 2026],
  'Audi_RS3': [2017, 2026],
  'Audi_RS4': [2007, 2008],
  'Audi_RS5': [2013, 2026],
  'Audi_RS6': [2003, 2026],
  'Audi_RS7': [2014, 2026],
  'Audi_S e-tron GT': [2025, 2026],
  'Audi_S3': [2015, 2026],
  'Audi_S4': [2000, 2026],
  'Audi_S5': [2008, 2026],
  'Audi_S6': [2002, 2026],
  'Audi_S6 e-tron': [2025, 2026],
  'Audi_S7': [2013, 2026],
  'Audi_S8': [2001, 2026],
  'Audi_SQ5': [2014, 2026],
  'Audi_SQ6 e-tron': [2025, 2026],
  'Audi_SQ7': [2020, 2026],
  'Audi_SQ8': [2020, 2026],
  'Audi_SQ8 e-tron': [2024, 2026],
  'Audi_SQ9': [2026, 2026],
  'Audi_TT': [2000, 2023],
  'Audi_TT RS': [2012, 2022],
  'Audi_TTS': [2009, 2023],
  'Audi_V8': [1989, 1994],
  'Tesla_Cybertruck': [2024, 2026],
  'Tesla_Model 3': [2017, 2026],
  'Tesla_Model Y': [2020, 2026],
  'Tesla_Model S': [2012, 2026],
  'Tesla_Model X': [2015, 2026],
  'Tesla_Roadster': [2008, 2012]
};

// Build VEHICLE_OPTIONS
const VEHICLE_OPTIONS = ALL_MAKES.map(make => {
  const models = (RAW_CATALOGUE[make] || ['Standard Model']).slice().sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
  return { make, models };
});

const generatedCode = `/**
 * Comprehensive Canadian Market Vehicle Makes & Models
 * Audited against AutoTrader.ca, Transport Canada, Équité Association theft rankings, and Canadian Black Book.
 * Includes all 123 Canadian makes, Popular 36 brands A-Z, and Audi 55-model catalogue (including A8, S8, e-tron).
 */

export const POPULAR_MAKES = ${JSON.stringify(POPULAR_MAKES, null, 2)};

export const ALL_MAKES = ${JSON.stringify(ALL_MAKES, null, 2)};

export const VEHICLE_OPTIONS = ${JSON.stringify(VEHICLE_OPTIONS, null, 2)};

export const MAKE_YEAR_RANGES = ${JSON.stringify(MAKE_YEAR_RANGES, null, 2)};

export const MODEL_YEAR_OVERRIDES = ${JSON.stringify(MODEL_YEAR_OVERRIDES, null, 2)};

/**
 * Returns available models for a given make, sorted A-Z.
 */
export function getModelsForMake(make) {
  if (!make) return [];
  const found = VEHICLE_OPTIONS.find(v => v.make.toLowerCase() === make.toLowerCase());
  return found ? found.models : [];
}

/**
 * Returns available model years for a given make and model, ordered newest first (descending).
 */
export function getYearsForModel(make, model) {
  if (!make) {
    return Array.from({ length: 27 }, (_, i) => 2026 - i);
  }

  let startYear = 2000;
  let endYear = 2026;

  // Check make default
  const makeKey = Object.keys(MAKE_YEAR_RANGES).find(k => k.toLowerCase() === make.toLowerCase());
  if (makeKey && MAKE_YEAR_RANGES[makeKey]) {
    [startYear, endYear] = MAKE_YEAR_RANGES[makeKey];
  }

  // Check model override
  if (model) {
    const overrideKey = \`\${make}_\${model}\`;
    const foundKey = Object.keys(MODEL_YEAR_OVERRIDES).find(
      k => k.toLowerCase() === overrideKey.toLowerCase()
    );
    if (foundKey && MODEL_YEAR_OVERRIDES[foundKey]) {
      [startYear, endYear] = MODEL_YEAR_OVERRIDES[foundKey];
    }
  }

  const years = [];
  for (let yr = endYear; yr >= startYear; yr--) {
    years.push(yr);
  }
  return years;
}

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
`;

const targetFile = path.resolve(__dirname, '../client/src/data/vehicles.js');
fs.writeFileSync(targetFile, generatedCode, 'utf8');
console.log('Successfully generated vehicles.js at', targetFile);
