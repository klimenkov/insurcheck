const key = process.env.LINEAR_API_KEY || process.argv[2];
if (!key) {
  console.error('Please provide LINEAR_API_KEY environment variable or argument');
  process.exit(1);
}

async function listLinearBoard() {
  const query = `{
    issues(first: 50, filter: { team: { key: { eq: "INS" } } }) {
      nodes {
        identifier
        title
        priority
        priorityLabel
        state {
          name
          type
        }
        description
      }
    }
  }`;

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': key },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const issues = data.data.issues.nodes;

  const statesOrder = ['In Progress', 'Todo', 'Backlog', 'Done'];
  const grouped = {};
  for (const s of statesOrder) grouped[s] = [];

  issues.forEach(issue => {
    const sName = issue.state.name;
    if (!grouped[sName]) grouped[sName] = [];
    grouped[sName].push(issue);
  });

  for (const state of Object.keys(grouped)) {
    const list = grouped[state];
    if (list.length === 0) continue;
    console.log(`\n=================== [ ${state.toUpperCase()} (${list.length}) ] ===================`);
    list.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority; // 1 = Urgent, 2 = High, etc.
      return a.identifier.localeCompare(b.identifier, undefined, { numeric: true });
    });
    list.forEach(i => {
      console.log(`- ${i.identifier} [${i.priorityLabel}]: ${i.title}`);
    });
  }
}

listLinearBoard().catch(console.error);
