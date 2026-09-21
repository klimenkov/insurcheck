const key = process.env.LINEAR_API_KEY || process.argv[2];
if (!key) {
  console.error('Please provide LINEAR_API_KEY environment variable or argument');
  process.exit(1);
}

async function updateIns8() {
  const query = `{
    issues(first: 50, filter: { team: { key: { eq: "INS" } } }) {
      nodes {
        id
        identifier
        title
      }
    }
  }`;

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': key },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  if (data.errors) {
    console.error('Errors:', data.errors);
    return;
  }
  const issue = data.data.issues.nodes.find(n => n.identifier === 'INS-8');
  if (!issue) {
    console.error('INS-8 not found');
    return;
  }
  console.log('Found issue:', issue.identifier, issue.id);

  const updatedDescription = `### Domain Availability & Pricing Analysis

#### 1. Official Registry & Availability Check
- **insurcheck.ca**: Available in CIRA registry, but requires **Canadian Presence Requirement (CPR)** (Canadian citizen, PR, or registered Canadian business).
- **insurcheck.com**: Registered since 2014, renewed until 2028, parked on GoDaddy.
- **getinsurcheck.com**: **AVAILABLE** (Verified via Verisign RDAP, 100% free to register globally with no residency restrictions).
- **insurcheck.co**: **AVAILABLE** (Tech/fintech favorite, single word).
- **insurcheck.app**: **AVAILABLE** (Google TLD with native HTTPS).
- **myinsurcheck.com**: **AVAILABLE**.
- **insurcheckontario.com**: **AVAILABLE**.

#### 2. Pricing & Renewal Comparison (USD / year)
| Domain / TLD | Registrar | Year 1 Price | Renewal Price | WHOIS Privacy | Residency Requirement |
|---|---|---|---|---|---|
| **getinsurcheck.com** (Recommended) | Porkbun / Cloudflare / Namecheap | **~$10.37 - $10.44** | **~$10.37 - $14.50** | Free Lifetime | None (Global) |
| **insurcheck.co** | Porkbun / Namecheap | **~$11.89 - $11.98** | ~$28.00 - $33.98 | Free Lifetime | None (Global) |
| **insurcheck.app** | Cloudflare / Porkbun | **~$14.00 - $14.56** | ~$14.00 - $14.56 | Free Lifetime | None (Global) |
| **insurcheck.net** | Porkbun / Cloudflare | **~$11.48 - $11.80** | ~$11.48 - $11.80 | Free Lifetime | None (Global) |
| **insurcheck.io** | Porkbun / Namecheap | **~$39.50 - $44.98** | ~$39.50 - $49.98 | Free Lifetime | None (Global) |

#### 3. Recommended Choice & Action Plan
- **Recommended domain**: \`getinsurcheck.com\` (lowest cost, universal trust, standard SaaS pattern).
- **Registrar recommendation**: [Porkbun](https://porkbun.com) or [Cloudflare Registrar](https://dash.cloudflare.com) (at-cost pricing, no renewal markup).

#### 4. Render DNS Setup Instructions (Once Registered)
1. Add custom domain in Render Web Service Settings:
   - Root: \`getinsurcheck.com\`
   - Subdomain: \`www.getinsurcheck.com\`
2. Set DNS Records at Registrar:
   - **ANAME / ALIAS** (or A-record): \`@\` -> \`insurcheck.onrender.com\` (or IP \`216.24.57.1\`)
   - **CNAME**: \`www\` -> \`insurcheck.onrender.com\`
3. Render automatically issues free auto-renewing Let's Encrypt SSL.`;

  // Update description
  const mutation = `mutation UpdateIssue($id: String!, $description: String!) {
    issueUpdate(id: $id, input: { description: $description }) {
      success
      issue {
        id
        identifier
        title
      }
    }
  }`;

  const updateRes = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': key },
    body: JSON.stringify({
      query: mutation,
      variables: { id: issue.id, description: updatedDescription }
    })
  });
  const updateData = await updateRes.json();
  console.log('Update result:', JSON.stringify(updateData, null, 2));

  // Also add a comment
  const commentMutation = `mutation CreateComment($issueId: String!, $body: String!) {
    commentCreate(input: { issueId: $issueId, body: $body }) {
      success
    }
  }`;
  const commentBody = `Added domain research, RDAP availability results, and pricing comparison across registrars (Porkbun, Cloudflare, Namecheap). Selected top candidate: **getinsurcheck.com** (~$10.37/yr, no Canadian presence requirement).`;

  const commentRes = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': key },
    body: JSON.stringify({
      query: commentMutation,
      variables: { issueId: issue.id, body: commentBody }
    })
  });
  const commentData = await commentRes.json();
  console.log('Comment result:', JSON.stringify(commentData, null, 2));
}

updateIns8().catch(console.error);
