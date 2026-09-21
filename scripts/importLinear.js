#!/usr/bin/env node

/**
 * CLI Tool to import InsurCheck product backlog into Linear via GraphQL API.
 * Usage:
 *   node scripts/importLinear.js <LINEAR_API_KEY>
 *   or:
 *   LINEAR_API_KEY=lin_api_... node scripts/importLinear.js
 */

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const TASKS = [
  {
    title: 'Automated Anomaly Detection & Rate Clamping ($50–$1,200/mo)',
    description: `## Context
Implement strict input validation on both client and server to filter out spam, test entries, and jokes (e.g. $10 or $9,999/mo) from corrupting actuarial benchmark statistics.

## Acceptance Criteria
- [ ] Clamp allowable monthly premium range between $50 and $1,200/mo.
- [ ] Display clear inline warning / guidance when unrealistic rates are entered.
- [ ] Flag borderline / outlier submissions as \`flagged_for_review\` instead of instantly publishing to community benchmarks.`,
    priority: 1, // Urgent
    status: 'Todo'
  },
  {
    title: 'Protected Admin Moderation Dashboard (/admin)',
    description: `## Context
Build a secure interface to review and moderate all incoming driver submissions, carrier reviews, and contact messages.

## Acceptance Criteria
- [ ] Secure admin authentication via PIN / password protection.
- [ ] Submissions and reviews table with pagination and search by city/carrier.
- [ ] Moderation actions: Approve, Hide, Delete.
- [ ] Inline editing to quickly fix typos in insurer names or review body text.`,
    priority: 2, // High
    status: 'Todo'
  },
  {
    title: 'Fuzzy Matching & Auto-Normalization for Insurer Names',
    description: `## Context
When drivers type carrier names manually, they often introduce typos ('td', 'meloche', 'belair', 'сонет'). We need an automated alias resolver mapping inputs to the 15 canonical Ontario insurers.

## Acceptance Criteria
- [ ] Alias mapping table and fuzzy matcher (\`td\`, \`meloche\` -> \`TD Insurance\`; \`belair\` -> \`Belairdirect\`).
- [ ] Automatic binding to the canonical insurer ID in the database.
- [ ] Unmatched entries saved under \`Other\` with original text preserved for admin review.`,
    priority: 2, // High
    status: 'Todo'
  },
  {
    title: 'Connect Custom Domain (insurcheck.ca / insurcheck.com)',
    description: `## Context
Launch the platform on a dedicated Canadian domain to establish user trust and maximize conversion (onrender.com subdomains reduce submission confidence).

## Acceptance Criteria
- [ ] Register insurcheck.ca / .com domain.
- [ ] Configure Cloudflare DNS and bind to Render Web Service.
- [ ] Ensure automatic SSL provisioning and HTTP -> HTTPS redirection.`,
    priority: 1, // Urgent
    status: 'Todo'
  },
  {
    title: 'OpenGraph Meta Tags & Social Share Previews',
    description: `## Context
Configure compelling rich social preview cards when sharing InsurCheck links across Telegram, WhatsApp, Reddit, and LinkedIn.

## Acceptance Criteria
- [ ] Add \`og:title\`, \`og:description\`, \`og:image\`, and Twitter card tags to \`index.html\`.
- [ ] Create an branded preview banner featuring Ontario rate benchmarks and InsurCheck branding.`,
    priority: 3, // Medium
    status: 'Todo'
  },
  {
    title: 'Actuarial Cohort Segmentation (Smart Recommendation Engine)',
    description: `## Context
As crowd data reaches 300–500+ submissions, cluster historical rates to identify which carriers consistently offer the best value for specific driver personas.

## Acceptance Criteria
- [ ] Define actuarial cohorts: Young G2 Novice / Suburban Prime Family / High-Theft Vehicle / Safe Rural Region.
- [ ] Calculate median premium and Value for Money index for each carrier within each cohort.`,
    priority: 2, // High
    status: 'Backlog'
  },
  {
    title: 'Personalized Carrier Recommendation Card in Sanity Check',
    description: `## Context
After calculating rate fairness, display an actionable recommendation card highlighting the most cost-effective, high-satisfaction carrier for the driver's exact profile.

## Acceptance Criteria
- [ ] Dynamic insight: 'For drivers your age in Ottawa, Desjardins offers the highest Value for Money rating (~$172/mo average).'
- [ ] Direct link to carrier review page and official Ontario quote portal.`,
    priority: 3, // Medium
    status: 'Backlog'
  },
  {
    title: 'Expand Playwright Scraper Pipeline to Sonnet & Belairdirect',
    description: `## Context
Currently, automated monthly rate harvesting only runs against Square One. Extend the pipeline to harvest public quote engines for Sonnet and Belairdirect.

## Acceptance Criteria
- [ ] Headless Playwright automation scripts for Sonnet and Belairdirect.
- [ ] Store harvested snapshots in \`scraped_quotes\` with timestamps and persona IDs.
- [ ] Run automated monthly ingestion schedule to track carrier rate inflation.`,
    priority: 3, // Medium
    status: 'Backlog'
  },
  {
    title: 'Integrate Quarterly FSRA Rate Filing Approvals',
    description: `## Context
Incorporate official quarterly rate change filings approved by Ontario regulator FSRA to calibrate our actuarial risk model.

## Acceptance Criteria
- [ ] Maintain regulator adjustment table with latest approved percentage changes across top 15 carriers.
- [ ] Display carrier rate trend badges (e.g. 'FSRA Q2 Approved: +3.4%') in review profiles.`,
    priority: 3, // Medium
    status: 'Backlog'
  },
  {
    title: 'Lightweight Privacy-First Web Analytics (PostHog / Umami)',
    description: `## Context
Integrate cookieless, privacy-respecting analytics to track funnel drop-off and conversion.

## Acceptance Criteria
- [ ] Track funnel milestones: Calculator Started -> Rate Calculated -> Rate Contributed -> Broker Connected.
- [ ] Conversion dashboard to measure user engagement and drop-off points.`,
    priority: 4, // Low
    status: 'Backlog'
  }
];

async function runGraphQL(apiKey, query, variables = {}) {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    },
    body: JSON.stringify({ query, variables })
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

async function main() {
  console.log('\n======================================================');
  console.log('🚀 InsurCheck → Linear CLI Backlog Importer');
  console.log('======================================================\n');

  let apiKey = process.argv[2] || process.env.LINEAR_API_KEY;

  if (!apiKey) {
    const rl = readline.createInterface({ input, output });
    apiKey = await rl.question('🔑 Enter your Linear API Key (get from linear.app/settings/api):\n> ');
    rl.close();
    apiKey = apiKey.trim();
  }

  if (!apiKey) {
    console.error('❌ Error: API Key not provided.');
    process.exitCode = 1;
    return;
  }

  console.log('\n📡 Connecting to Linear API...');

  let data;
  try {
    data = await runGraphQL(
      apiKey,
      `query {
        viewer {
          id
          name
          email
        }
        teams {
          nodes {
            id
            name
            key
            states {
              nodes {
                id
                name
                type
              }
            }
          }
        }
      }`
    );
  } catch (err) {
    console.error(`❌ Authentication error: ${err.message}`);
    console.log('\n💡 Tip: Check your API Key at https://linear.app/settings/api (Personal API Keys).');
    process.exitCode = 1;
    return;
  }

  const user = data.viewer;
  const teams = data.teams.nodes;

  if (!teams || teams.length === 0) {
    console.error('❌ Error: No team found in your Linear workspace. Please create a team first.');
    process.exitCode = 1;
    return;
  }

  // Pick team (prefer InsurCheck, or first team)
  const team = teams.find(t => t.name.toLowerCase().includes('insur') || t.key === 'INS') || teams[0];

  console.log(`✅ Authenticated as: ${user.name || user.email}`);
  console.log(`🎯 Target team: "${team.name}" [${team.key}]\n`);

  // Find states
  const states = team.states.nodes;
  const todoState = states.find(s => s.type === 'unstarted' || s.name.toLowerCase() === 'todo') || states[0];
  const backlogState = states.find(s => s.type === 'backlog' || s.name.toLowerCase() === 'backlog') || states[0];

  console.log(`📦 Uploading ${TASKS.length} issues to Linear...\n`);

  let createdCount = 0;

  for (const task of TASKS) {
    const targetState = task.status === 'Backlog' ? backlogState : todoState;

    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            url
          }
        }
      }
    `;

    try {
      const res = await runGraphQL(apiKey, mutation, {
        input: {
          teamId: team.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          stateId: targetState.id
        }
      });

      if (res.issueCreate?.success) {
        const issue = res.issueCreate.issue;
        const priorityIcon = task.priority === 1 ? '🔴 [Urgent]' : task.priority === 2 ? '🟠 [High]' : '🟡 [Medium]';
        console.log(`✔ [${issue.identifier}] ${priorityIcon} ${issue.title}`);
        createdCount++;
      }
    } catch (err) {
      console.error(`✖ Error creating "${task.title}": ${err.message}`);
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 Successfully created issues: ${createdCount} of ${TASKS.length}!`);
  console.log(`🔗 Open Linear board: https://linear.app`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exitCode = 1;
});
