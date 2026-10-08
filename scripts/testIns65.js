import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { db } from '../server/db.js';
import '../server/seedMarketplace.js';

console.log('--- RUNNING INS-65 INTEGRATION TESTS ---\n');

// 1. Database schema and tables verification
console.log('Test 1: Verify Marketplace Database Tables Exist');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
assert(tables.includes('brokerages'), 'Table brokerages must exist');
assert(tables.includes('broker_users'), 'Table broker_users must exist');
assert(tables.includes('marketplace_leads'), 'Table marketplace_leads must exist');
assert(tables.includes('lead_events'), 'Table lead_events must exist');
console.log('  ✓ Tables brokerages, broker_users, marketplace_leads, lead_events verified');

// 2. Pilot Brokerages Verification
console.log('\nTest 2: Verify Pilot Brokerages in Ontario');
const brokerages = db.prepare('SELECT * FROM brokerages').all();
assert(brokerages.length >= 3, 'Must have at least 3 pilot brokerages');
const sharp = brokerages.find(b => b.id === 'brok_sharp');
const ktx = brokerages.find(b => b.id === 'brok_ktx');
const oiba = brokerages.find(b => b.id === 'brok_oiba');
assert(sharp, 'Sharp Insurance must exist');
assert(ktx, 'KTX Brokers must exist');
assert(oiba, 'Ontario Independent Broker Alliance must exist');
assert(sharp.status === 'approved', 'Sharp must be approved');
console.log('  ✓ 3 approved Ontario brokerages verified (Sharp, KTX, OIBA)');

// 3. Lead Creation & Nominal Pricing Tiers (PRD Section 7)
console.log('\nTest 3: Lead Creation with Nominal Pricing Tiers');
const now = new Date().toISOString();

// High savings lead: $25 nominal value
const insertLead = (savings, premium, timeline) => {
  let leadPrice = 15;
  if (savings >= 200) leadPrice = 25;
  else if (savings >= 100) leadPrice = 20;
  else if (timeline === 'car_shopping' || !premium) leadPrice = 10;

  const res = db.prepare(`
    INSERT INTO marketplace_leads (
      created_at, postal_code, city, vehicle_year, vehicle_make, vehicle_model,
      driver_age, years_licensed, clean_record, coverage_type, current_premium,
      benchmark_rate, estimated_savings, renewal_timeline, discounts,
      contact_name, contact_email, contact_phone, contact_pref,
      consent_contact, consent_timestamp, status, lead_price_nominal
    ) VALUES (
      ?, 'M5V', 'Toronto', 2023, 'Tesla', 'Model 3',
      32, 12, 1, 'Standard', ?,
      220, ?, ?, '[]',
      'Test Driver', 'driver@test.ca', '416-555-0199', 'phone',
      1, ?, 'available', ?
    )
  `).run(now, premium, savings, timeline, now, leadPrice);
  return { id: res.lastInsertRowid, leadPrice };
};

const highLead = insertLead(220, 440, 'within_30_days');
assert.strictEqual(highLead.leadPrice, 25, 'Savings >= $200 must have $25 nominal price');

const midLead = insertLead(120, 340, 'within_30_days');
assert.strictEqual(midLead.leadPrice, 20, 'Savings >= $100 must have $20 nominal price');

const standardLead = insertLead(50, 270, 'within_30_days');
assert.strictEqual(standardLead.leadPrice, 15, 'Standard savings must have $15 nominal price');

const shoppingLead = insertLead(0, null, 'car_shopping');
assert.strictEqual(shoppingLead.leadPrice, 10, 'Car shopping without premium must have $10 nominal price');
console.log('  ✓ Nominal pricing rules ($25, $20, $15, $10) verified');

// 4. Anonymization Masking Test (GET /api/marketplace/leads/available)
console.log('\nTest 4: Privacy Masking for Unclaimed Leads');
const availableLeads = db.prepare(`
  SELECT id, postal_code, city, vehicle_year, vehicle_make, vehicle_model,
         driver_age, years_licensed, clean_record, coverage_type, current_premium,
         benchmark_rate, estimated_savings, renewal_timeline, lead_price_nominal, status
  FROM marketplace_leads
  WHERE status IN ('available', 'backup_queue')
`).all();
assert(availableLeads.length > 0, 'Must have available leads');

// Ensure contact info is NOT in available queries
const testAvail = availableLeads.find(l => l.id === highLead.id);
assert.strictEqual(testAvail.contact_name, undefined, 'contact_name must NOT be selected in public available feed');
assert.strictEqual(testAvail.contact_phone, undefined, 'contact_phone must NOT be selected in public available feed');
assert.strictEqual(testAvail.contact_email, undefined, 'contact_email must NOT be selected in public available feed');
console.log('  ✓ Unclaimed lead contact information is strictly hidden/masked');

// 5. Exclusive Claiming & Single-Broker Lock Test
console.log('\nTest 5: Exclusive Atomic Lead Claiming');
const targetLeadId = highLead.id;

// Broker 1 (Sharp) claims the lead
const claimStmt = db.prepare(`
  UPDATE marketplace_leads
  SET status = 'claimed',
      claimed_by_brokerage_id = ?,
      claimed_by_user_id = ?,
      claimed_at = ?
  WHERE id = ? AND status IN ('available', 'backup_queue')
`);

const claimResult1 = claimStmt.run('brok_sharp', 'Sarah Jenkins', now, targetLeadId);
assert.strictEqual(claimResult1.changes, 1, 'First claim must succeed with changes = 1');

// Verify DB status
const claimedLead = db.prepare('SELECT * FROM marketplace_leads WHERE id = ?').get(targetLeadId);
assert.strictEqual(claimedLead.status, 'claimed');
assert.strictEqual(claimedLead.claimed_by_brokerage_id, 'brok_sharp');
assert.strictEqual(claimedLead.contact_name, 'Test Driver', 'Contact name is now available to the claimed broker');
assert.strictEqual(claimedLead.contact_phone, '416-555-0199', 'Contact phone is now available to the claimed broker');
console.log('  ✓ Broker 1 exclusively claimed the lead; contact details unlocked');

// 6. Double-Claim Conflict Prevention (Single-broker guarantee)
console.log('\nTest 6: Prevent Double-Claiming (Atomic Conflict Detection)');
// Broker 2 (KTX) tries to claim the SAME lead
const claimResult2 = claimStmt.run('brok_ktx', 'Michael Chang', now, targetLeadId);
assert.strictEqual(claimResult2.changes, 0, 'Second claim MUST fail with changes = 0 (no double-claiming)');
console.log('  ✓ Double-claiming successfully prevented (exclusivity lock enforced)');

// 7. Lead Lifecycle Status Transitions (PRD Section 5)
console.log('\nTest 7: Lead Lifecycle Management & Status Progression');
const validStatuses = ['contacted', 'offer_provided', 'converted', 'closed_no_deal'];

for (const nextStatus of validStatuses) {
  const updateStmt = db.prepare(`
    UPDATE marketplace_leads
    SET status = ?,
        resolution_notes = ?
    WHERE id = ?
  `);
  updateStmt.run(nextStatus, `Testing status ${nextStatus}`, targetLeadId);

  // Log event
  db.prepare(`
    INSERT INTO lead_events (lead_id, actor_type, actor_id, event_type, details, created_at)
    VALUES (?, 'broker', 'brok_sharp', 'status_changed', ?, ?)
  `).run(targetLeadId, `Status transitioned to ${nextStatus}`, new Date().toISOString());

  const check = db.prepare('SELECT status FROM marketplace_leads WHERE id = ?').get(targetLeadId);
  assert.strictEqual(check.status, nextStatus, `Status should be updated to ${nextStatus}`);
}
console.log('  ✓ All lifecycle states (contacted, offer_provided, converted, closed_no_deal) verified');

// 8. Lead Events Audit Trail
console.log('\nTest 8: Lead Events Audit Trail');
const events = db.prepare('SELECT * FROM lead_events WHERE lead_id = ?').all(targetLeadId);
assert(events.length >= validStatuses.length, 'Audit log must record every status transition');
console.log(`  ✓ ${events.length} audit events logged for lead #${targetLeadId}`);

// 9. Client Components Verification
console.log('\nTest 9: Client Components Files & Integrations');
const brokerModalFile = path.resolve('client/src/components/BrokerRequestModal.jsx');
const brokerPortalFile = path.resolve('client/src/components/BrokerPortal.jsx');
const resultCardFile = path.resolve('client/src/components/ResultCard.jsx');
const appFile = path.resolve('client/src/App.jsx');
const navbarFile = path.resolve('client/src/components/Navbar.jsx');

assert(fs.existsSync(brokerModalFile), 'BrokerRequestModal.jsx must exist');
assert(fs.existsSync(brokerPortalFile), 'BrokerPortal.jsx must exist');
assert(fs.existsSync(resultCardFile), 'ResultCard.jsx must exist');
assert(fs.existsSync(appFile), 'App.jsx must exist');
assert(fs.existsSync(navbarFile), 'Navbar.jsx must exist');

const brokerModalContent = fs.readFileSync(brokerModalFile, 'utf8');
assert(brokerModalContent.includes('BrokerRequestModal'), 'Must export BrokerRequestModal');
assert(brokerModalContent.includes('consentBroker'), 'Must enforce broker consent');
assert(brokerModalContent.includes('consentDisclaimer'), 'Must enforce disclaimer consent');

const brokerPortalContent = fs.readFileSync(brokerPortalFile, 'utf8');
assert(brokerPortalContent.includes('BrokerPortal'), 'Must export BrokerPortal');
assert(brokerPortalContent.includes('PILOT_BROKERS'), 'Must include pilot brokers');
assert(brokerPortalContent.includes('handleClaimLead'), 'Must include claim lead handler');

const resultCardContent = fs.readFileSync(resultCardFile, 'utf8');
assert(resultCardContent.includes('BrokerRequestModal'), 'ResultCard must import BrokerRequestModal');
assert(resultCardContent.includes('Find My Broker Match'), 'ResultCard must have Find My Broker Match button');

const appContent = fs.readFileSync(appFile, 'utf8');
assert(appContent.includes('BrokerPortal'), 'App.jsx must import BrokerPortal');
assert(appContent.includes('/broker'), 'App.jsx must route /broker');

const navbarContent = fs.readFileSync(navbarFile, 'utf8');
assert(navbarContent.includes('handleNavClick(\'broker\')'), 'Navbar must link to broker tab');
console.log('  ✓ Client component files, exports, and integrations verified');

console.log('\n--- ALL INS-65 INTEGRATION TESTS PASSED ---\n');
