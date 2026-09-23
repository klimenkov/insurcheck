import { db } from './db.js';

console.log('Clearing existing seed data...');
db.exec(`
DELETE FROM reviews;
DELETE FROM insurers;
DELETE FROM submissions;
DELETE FROM platform_stats;
`);

// 1. Seed Insurers with Ontario details
const insertInsurer = db.prepare(`
INSERT INTO insurers (id, name, logo_color, avg_monthly, claims_rating, support_rating, price_rating, total_reviews, pros, cons, direct_online, broker_only, website)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insurers = [
  {
    id: 'belairdirect',
    name: 'Belairdirect',
    logo_color: '#005691',
    avg_monthly: 215,
    claims_rating: 4.1,
    support_rating: 4.3,
    price_rating: 4.5,
    total_reviews: 48,
    pros: 'User-friendly mobile app, quick online quote setup, automerit discount',
    cons: 'Renewal rates often creep up after year 1, phone wait times during peak hours',
    direct_online: 1,
    broker_only: 0,
    website: 'https://www.belairdirect.com'
  },
  {
    id: 'intact',
    name: 'Intact Insurance',
    logo_color: '#e31b23',
    avg_monthly: 245,
    claims_rating: 4.6,
    support_rating: 4.4,
    price_rating: 3.8,
    total_reviews: 62,
    pros: 'Largest network in Canada, top-tier claims speed and reliable repair centers',
    cons: 'Pricier baseline than direct-only competitors, best accessed via brokers',
    direct_online: 0,
    broker_only: 1,
    website: 'https://www.intact.ca'
  },
  {
    id: 'td',
    name: 'TD Insurance (Meloche Monnex)',
    logo_color: '#008a00',
    avg_monthly: 228,
    claims_rating: 3.9,
    support_rating: 3.7,
    price_rating: 4.2,
    total_reviews: 55,
    pros: 'Huge university alumni and professional group discounts, multi-product banking bundle',
    cons: 'Claims adjusters can be hard to reach, stringent renewal re-rating',
    direct_online: 1,
    broker_only: 0,
    website: 'https://www.tdinsurance.com'
  },
  {
    id: 'desjardins',
    name: 'Desjardins Insurance',
    logo_color: '#00874e',
    avg_monthly: 232,
    claims_rating: 4.3,
    support_rating: 4.2,
    price_rating: 4.0,
    total_reviews: 39,
    pros: 'Ajusto telematics discount up to 25%, great customer support for bilingual drivers',
    cons: 'App tracking can be strict on braking/speed, limited broker channel',
    direct_online: 1,
    broker_only: 0,
    website: 'https://www.desjardinsgeneralinsurance.com'
  },
  {
    id: 'caa',
    name: 'CAA Insurance',
    logo_color: '#002f6c',
    avg_monthly: 198,
    claims_rating: 4.7,
    support_rating: 4.8,
    price_rating: 4.6,
    total_reviews: 44,
    pros: 'CAA MyPace pay-as-you-drive for low mileage, 20% discount for CAA members',
    cons: 'Requires device installation for pay-per-km, quotes can be conservative for new drivers',
    direct_online: 1,
    broker_only: 0,
    website: 'https://www.caainsurance.ca'
  },
  {
    id: 'aviva',
    name: 'Aviva Canada',
    logo_color: '#ffdd00',
    avg_monthly: 240,
    claims_rating: 4.2,
    support_rating: 4.0,
    price_rating: 3.9,
    total_reviews: 36,
    pros: 'Lyft/rideshare coverage endorsements, broad broker distribution',
    cons: 'High renewal jumps in Brampton/Mississauga, broker intermediary required for changes',
    direct_online: 0,
    broker_only: 1,
    website: 'https://www.aviva.ca'
  },
  {
    id: 'sonnet',
    name: 'Sonnet Insurance',
    logo_color: '#34495e',
    avg_monthly: 220,
    claims_rating: 3.8,
    support_rating: 4.1,
    price_rating: 4.3,
    total_reviews: 41,
    pros: '100% digital quote and purchase in 5 minutes, transparent policy document view',
    cons: 'Known for steep year-2 rate adjustments, entirely chat/email based claims handling',
    direct_online: 1,
    broker_only: 0,
    website: 'https://www.sonnet.ca'
  },
  {
    id: 'onlia',
    name: 'Onlia',
    logo_color: '#ff6b00',
    avg_monthly: 205,
    claims_rating: 4.0,
    support_rating: 4.2,
    price_rating: 4.4,
    total_reviews: 29,
    pros: 'Cashback reward incentives for safe driving scores, sleek digital interface',
    cons: 'Strict vehicle eligibility limits, underwritten by Verassure with limited broker access',
    direct_online: 1,
    broker_only: 0,
    website: 'https://www.onlia.ca'
  }
];

for (const ins of insurers) {
  insertInsurer.run(
    ins.id, ins.name, ins.logo_color, ins.avg_monthly, ins.claims_rating,
    ins.support_rating, ins.price_rating, ins.total_reviews, ins.pros, ins.cons,
    ins.direct_online, ins.broker_only, ins.website
  );
}

// 2. Seed Real Claims & Support Reviews
const insertReview = db.prepare(`
INSERT INTO reviews (insurer_id, created_at, rating, title, body, had_accident, claims_experience, payout_speed, author_city, vehicle, monthly_premium)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const reviews = [
  {
    insurer_id: 'belairdirect',
    created_at: '2026-08-10',
    rating: 4.5,
    title: 'Great app, but renewal went up $35 for no reason',
    body: 'Signing up was super painless. Everything on the mobile app. But after 12 months with zero tickets or accidents, renewal notice arrived with a $35/mo hike. Had to call and negotiate down to $15.',
    had_accident: 0,
    claims_experience: 'N/A',
    payout_speed: 'N/A',
    author_city: 'Markham',
    vehicle: '2021 Toyota RAV4',
    monthly_premium: 195
  },
  {
    insurer_id: 'intact',
    created_at: '2026-07-22',
    rating: 5.0,
    title: 'Not-at-fault collision handled in 3 days',
    body: 'Someone backed into my passenger door in a plaza parking lot. Intact assigned an adjuster within 4 hours, authorized a rental via Enterprise immediately, and car was fixed at certified shop in 6 days. Worth the slightly higher premium.',
    had_accident: 1,
    claims_experience: 'Prompt adjuster, rental car booked seamlessly, zero deductible hassle',
    payout_speed: '3 days',
    author_city: 'Mississauga',
    vehicle: '2022 Honda Civic',
    monthly_premium: 260
  },
  {
    insurer_id: 'caa',
    created_at: '2026-09-01',
    rating: 5.0,
    title: 'CAA MyPace is the ultimate hack if you work from home',
    body: 'I drive under 8,000 km per year because of remote work. I was paying $210 with TD, switched to CAA MyPace and now pay around $115/month based on actual mileage. Absolutely unbeatable.',
    had_accident: 0,
    claims_experience: 'N/A',
    payout_speed: 'N/A',
    author_city: 'Toronto (Midtown)',
    vehicle: '2019 Subaru Outback',
    monthly_premium: 115
  },
  {
    insurer_id: 'td',
    created_at: '2026-06-18',
    rating: 3.0,
    title: 'Good initial rate, but getting through to claims is a nightmare',
    body: 'Cheap rates if you graduated from UofT or Ryerson. But when windshield caught a rock on the 401, I was on hold for 85 minutes to file a glass claim. If you value customer service over price, look elsewhere.',
    had_accident: 1,
    claims_experience: 'Long hold times, bureaucratic paperwork for glass replacement',
    payout_speed: '14 days',
    author_city: 'Toronto (Downtown)',
    vehicle: '2020 Mazda CX-5',
    monthly_premium: 175
  },
  {
    insurer_id: 'sonnet',
    created_at: '2026-08-29',
    rating: 3.5,
    title: '100% digital quote was fast, but year 2 shock was real',
    body: 'Loved that I did not have to speak to a broker or sales rep. Got approved in 10 minutes online. Year 1 was $180/mo. Year 2 renewal came in at $245/mo with no changes on my record. Switched away immediately.',
    had_accident: 0,
    claims_experience: 'N/A',
    payout_speed: 'N/A',
    author_city: 'Vaughan',
    vehicle: '2023 Hyundai Elantra',
    monthly_premium: 180
  },
  {
    insurer_id: 'desjardins',
    created_at: '2026-07-05',
    rating: 4.5,
    title: 'Ajusto discount knocked off 18%',
    body: 'The Ajusto app is sensitive if you brake hard for yellow lights, but overall after 100 days my discount settled at 18%. Customer service reps are very polite and clear.',
    had_accident: 0,
    claims_experience: 'N/A',
    payout_speed: 'N/A',
    author_city: 'Ottawa',
    vehicle: '2021 Toyota Corolla',
    monthly_premium: 140
  },
  {
    insurer_id: 'intact',
    created_at: '2026-08-14',
    rating: 4.0,
    title: 'Brampton postal code hurts, but service is solid',
    body: 'L6Y postal code means you pay high regardless. Broker got me with Intact. Had an animal strike on country road, claim processed without any argument.',
    had_accident: 1,
    claims_experience: 'Fair valuation, direct payment to body shop',
    payout_speed: '5 days',
    author_city: 'Brampton',
    vehicle: '2022 Ford F-150',
    monthly_premium: 345
  }
];

for (const rev of reviews) {
  insertReview.run(
    rev.insurer_id, rev.created_at, rev.rating, rev.title, rev.body,
    rev.had_accident, rev.claims_experience, rev.payout_speed,
    rev.author_city, rev.vehicle, rev.monthly_premium
  );
}

// 3. Seed Realistic Community Submissions
const insertSub = db.prepare(`
INSERT INTO submissions (created_at, fsa, city, vehicle_make, vehicle_model, vehicle_year, driver_age, driver_profile, years_licensed, clean_record, provider_name, monthly_premium, coverage_type, comment)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const submissions = [
  { created_at: '2026-09-12', fsa: 'L6P', city: 'Brampton', vehicle_make: 'Honda', vehicle_model: 'Civic', vehicle_year: 2022, driver_age: 23, driver_profile: 'young', years_licensed: 3, clean_record: 1, provider_name: 'Aviva', monthly_premium: 440, coverage_type: 'Standard', comment: 'Insane price for young driver in Brampton' },
  { created_at: '2026-09-11', fsa: 'L6Y', city: 'Brampton', vehicle_make: 'Lexus', vehicle_model: 'RX350', vehicle_year: 2023, driver_age: 42, driver_profile: 'experienced', years_licensed: 18, clean_record: 1, provider_name: 'Intact', monthly_premium: 385, coverage_type: 'Comprehensive', comment: 'Theft tag mandatory, price jumped 30% from last year' },
  { created_at: '2026-09-10', fsa: 'M5V', city: 'Toronto (Downtown)', vehicle_make: 'Mazda', vehicle_model: 'CX-5', vehicle_year: 2021, driver_age: 34, driver_profile: 'experienced', years_licensed: 12, clean_record: 1, provider_name: 'Belairdirect', monthly_premium: 195, coverage_type: 'Standard', comment: 'Underground condo parking discount applied' },
  { created_at: '2026-09-09', fsa: 'K1P', city: 'Ottawa', vehicle_make: 'Subaru', vehicle_model: 'Outback', vehicle_year: 2020, driver_age: 39, driver_profile: 'experienced', years_licensed: 16, clean_record: 1, provider_name: 'CAA', monthly_premium: 135, coverage_type: 'Standard', comment: 'Ottawa rates are so much better than GTA' },
  { created_at: '2026-09-08', fsa: 'L5M', city: 'Mississauga', vehicle_make: 'Toyota', vehicle_model: 'RAV4', vehicle_year: 2022, driver_age: 29, driver_profile: 'experienced', years_licensed: 8, clean_record: 1, provider_name: 'TD Insurance', monthly_premium: 240, coverage_type: 'Standard', comment: 'Alumni group discount included' },
  { created_at: '2026-09-07', fsa: 'L4B', city: 'Richmond Hill', vehicle_make: 'Tesla', vehicle_model: 'Model 3', vehicle_year: 2023, driver_age: 36, driver_profile: 'experienced', years_licensed: 14, clean_record: 1, provider_name: 'Desjardins', monthly_premium: 275, coverage_type: 'Comprehensive', comment: 'EV parts repair surcharge is noticeable' },
  { created_at: '2026-09-05', fsa: 'M1B', city: 'Toronto (Scarborough)', vehicle_make: 'Hyundai', vehicle_model: 'Elantra', vehicle_year: 2020, driver_age: 26, driver_profile: 'young', years_licensed: 5, clean_record: 1, provider_name: 'Sonnet', monthly_premium: 290, coverage_type: 'Standard', comment: 'Scarborough rate is almost as high as Brampton' },
  { created_at: '2026-09-04', fsa: 'N2L', city: 'Waterloo', vehicle_make: 'Volkswagen', vehicle_model: 'Golf', vehicle_year: 2019, driver_age: 28, driver_profile: 'experienced', years_licensed: 9, clean_record: 1, provider_name: 'Onlia', monthly_premium: 165, coverage_type: 'Standard', comment: 'Waterloo rate is decent, Onlia cash rewards work' },
  { created_at: '2026-09-02', fsa: 'L8P', city: 'Hamilton', vehicle_make: 'Ford', vehicle_model: 'F-150', vehicle_year: 2021, driver_age: 48, driver_profile: 'experienced', years_licensed: 25, clean_record: 1, provider_name: 'Intact', monthly_premium: 210, coverage_type: 'Standard', comment: 'Commercial / personal combo' }
];

for (const s of submissions) {
  insertSub.run(
    s.created_at, s.fsa, s.city, s.vehicle_make, s.vehicle_model, s.vehicle_year,
    s.driver_age, s.driver_profile, s.years_licensed, s.clean_record,
    s.provider_name, s.monthly_premium, s.coverage_type, s.comment
  );
}

// 4. Seed Platform Stats (Total Saved counter, etc.)
const insertStat = db.prepare('INSERT INTO platform_stats (key, value) VALUES (?, ?)');
insertStat.run('total_money_saved', 0);
insertStat.run('total_checks_run', 0);
insertStat.run('avg_monthly_overpay', 0);

console.log('Database seeded successfully!');
