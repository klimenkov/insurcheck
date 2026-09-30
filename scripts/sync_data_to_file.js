import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

async function run() {
  const { db } = await import('../server/db.js');
  const subs = db.prepare('SELECT * FROM submissions ORDER BY id ASC').all();
  const revs = db.prepare('SELECT * FROM reviews ORDER BY id ASC').all();
  const fb = db.prepare('SELECT * FROM benchmark_feedback ORDER BY id ASC').all();
  const leads = db.prepare('SELECT * FROM leads ORDER BY id ASC').all();
  const statsRows = db.prepare('SELECT * FROM platform_stats').all();
  const stats = {};
  for (const r of statsRows) stats[r.key] = r.value;

  const targetFile = path.join(rootDir, 'server', 'initialData.js');
  const content = `// Auto-generated snapshot of authoritative platform data
export const initialSubmissions = ${JSON.stringify(subs, null, 2)};

export const initialReviews = ${JSON.stringify(revs, null, 2)};

export const initialFeedback = ${JSON.stringify(fb, null, 2)};

export const initialLeads = ${JSON.stringify(leads, null, 2)};

export const initialStats = ${JSON.stringify(stats, null, 2)};
`;

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Successfully generated server/initialData.js with:');
  console.log('  Submissions:', subs.length);
  console.log('  Reviews:', revs.length);
  console.log('  Feedback:', fb.length);
  console.log('  Leads:', leads.length);
  console.log('  Stats:', stats);
}

run().catch(err => {
  console.error('Error syncing data:', err);
  process.exit(1);
});
