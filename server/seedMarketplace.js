import { db } from './db.js';

export function ensureMarketplacePopulated() {
  // 1. Seed pilot brokerages
  const brokeragesCount = db.prepare('SELECT COUNT(*) as cnt FROM brokerages').get().cnt;
  if (brokeragesCount === 0) {
    const insertBrokerage = db.prepare(`
      INSERT INTO brokerages (id, name, license_number, contact_email, phone, territories, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBrokerage.run(
      'brok_sharp',
      'Sharp Insurance Ontario',
      'RIBO #48192',
      'contact@sharpinsurance.ca',
      '1-877-218-2838',
      JSON.stringify(['Toronto', 'Mississauga', 'Brampton', 'York Region']),
      'approved',
      new Date().toISOString()
    );

    insertBrokerage.run(
      'brok_ktx',
      'KTX Insurance Brokers (Rates.ca Partner)',
      'RIBO #51902',
      'inquiries@ktxbrokers.ca',
      '1-855-472-8371',
      JSON.stringify(['Greater Toronto Area', 'Hamilton', 'Kitchener-Waterloo', 'Ottawa']),
      'approved',
      new Date().toISOString()
    );

    insertBrokerage.run(
      'brok_oiba',
      'Ontario Independent Broker Alliance',
      'RIBO #39910',
      'partners@ontariobrokers.ca',
      '1-800-361-9482',
      JSON.stringify(['All Ontario']),
      'approved',
      new Date().toISOString()
    );

    console.log('Seeded 3 pilot brokerages in Ontario.');
  }

  // 2. Seed pilot broker users
  const usersCount = db.prepare('SELECT COUNT(*) as cnt FROM broker_users').get().cnt;
  if (usersCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO broker_users (id, brokerage_id, name, email, token, role, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'usr_sarah',
      'brok_sharp',
      'Sarah Jenkins (Principal Broker)',
      'sarah@sharpinsurance.ca',
      'pilot-sharp-token',
      'admin',
      'active',
      new Date().toISOString()
    );

    insertUser.run(
      'usr_michael',
      'brok_ktx',
      'Michael Chen (Senior Account Exec)',
      'mchen@ktxbrokers.ca',
      'pilot-ktx-token',
      'agent',
      'active',
      new Date().toISOString()
    );

    insertUser.run(
      'usr_david',
      'brok_oiba',
      'David Ross (Managing Broker)',
      'dross@ontariobrokers.ca',
      'pilot-oiba-token',
      'admin',
      'active',
      new Date().toISOString()
    );

    console.log('Seeded 3 broker users.');
  }

  // 3. Seed realistic pilot marketplace leads
  const leadsCount = db.prepare('SELECT COUNT(*) as cnt FROM marketplace_leads').get().cnt;
  if (leadsCount === 0) {
    const insertLead = db.prepare(`
      INSERT INTO marketplace_leads (
        postal_code, city, vehicle_year, vehicle_make, vehicle_model,
        driver_age, years_licensed, clean_record, coverage_type,
        current_premium, benchmark_rate, estimated_savings, renewal_timeline,
        discounts, contact_name, contact_email, contact_phone, contact_pref,
        consent_contact, consent_timestamp, status, claimed_by_brokerage_id,
        claimed_by_user_id, claimed_at, contacted_at, resolved_at, resolution_status,
        resolution_notes, lead_price_nominal, created_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `);

    const now = new Date();
    const subHours = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString();

    // Lead 1: High opportunity lead in Toronto ($230/mo savings opportunity)
    insertLead.run(
      'M4G', 'Toronto', 2024, 'Honda', 'Civic',
      32, 10, 1, 'Standard',
      450, 220, 230, 'within_30_days',
      JSON.stringify(['winter_tires']), 'Alex Tremblay', 'alex.tremblay@example.ca', '416-555-0192', 'phone',
      1, subHours(2), 'available', null,
      null, null, null, null, null,
      null, 20, subHours(2)
    );

    // Lead 2: Young commuter in Brampton ($180/mo savings opportunity)
    insertLead.run(
      'L6P', 'Brampton', 2023, 'Hyundai', 'Elantra',
      26, 6, 1, 'Standard',
      380, 200, 180, 'immediate',
      JSON.stringify(['winter_tires', 'bundle_home']), 'Priya Sharma', 'priya.s@example.ca', '905-555-0143', 'whatsapp',
      1, subHours(5), 'available', null,
      null, null, null, null, null,
      null, 15, subHours(5)
    );

    // Lead 3: Family SUV in Mississauga ($140/mo savings opportunity)
    insertLead.run(
      'L5B', 'Mississauga', 2022, 'Toyota', 'RAV4',
      44, 18, 1, 'Comprehensive',
      310, 170, 140, '1_to_3_months',
      JSON.stringify(['multi_vehicle', 'bundle_home']), 'Mark Kowalski', 'm.kowalski@example.ca', '905-555-0187', 'email',
      1, subHours(8), 'available', null,
      null, null, null, null, null,
      null, 15, subHours(8)
    );

    // Lead 4: Car shopping in Markham (estimating scenario)
    insertLead.run(
      'L3R', 'Markham', 2024, 'Tesla', 'Model Y',
      35, 14, 1, 'Comprehensive',
      null, 260, 0, 'car_shopping',
      JSON.stringify(['winter_tires']), 'Kevin Wong', 'kevin.w@example.ca', '416-555-0164', 'phone',
      1, subHours(11), 'available', null,
      null, null, null, null, null,
      null, 10, subHours(11)
    );

    // Lead 5: Claimed lead by Sharp Insurance (in progress)
    insertLead.run(
      'M1P', 'Scarborough', 2021, 'Mazda', 'CX-5',
      39, 15, 0, 'Standard',
      290, 210, 80, 'within_30_days',
      JSON.stringify(['winter_tires']), 'Elena Rostova', 'elena.rostova@example.ca', '416-555-0129', 'phone',
      1, subHours(18), 'claimed', 'brok_sharp',
      'usr_sarah', subHours(4), subHours(3), null, null,
      'Called driver, left voicemail regarding quote comparison.', 15, subHours(18)
    );

    // Lead 6: Lead in backup queue (>14 hours unclaimed)
    insertLead.run(
      'K1P', 'Ottawa', 2020, 'Subaru', 'Outback',
      50, 25, 1, 'Standard',
      240, 180, 60, '1_to_3_months',
      JSON.stringify(['bundle_home']), 'Robert Gagnon', 'r.gagnon@example.ca', '613-555-0155', 'email',
      1, subHours(16), 'backup_queue', null,
      null, null, null, null, null,
      null, 10, subHours(16)
    );

    console.log('Seeded 6 sample marketplace leads.');
  }
}

// Auto-populate marketplace if empty
ensureMarketplacePopulated();

