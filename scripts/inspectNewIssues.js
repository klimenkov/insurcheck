const key = process.env.LINEAR_API_KEY || process.argv[2];

async function inspectNewIssues() {
  const query = `{
    issues(first: 50, filter: { team: { key: { eq: "INS" } } }) {
      nodes {
        identifier
        title
        priorityLabel
        state { name }
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
  const targetIds = ['INS-27', 'INS-28', 'INS-29', 'INS-8', 'INS-9'];
  const issues = data.data.issues.nodes.filter(i => targetIds.includes(i.identifier));

  issues.forEach(i => {
    console.log(`\n=================== ${i.identifier}: ${i.title} [${i.priorityLabel} / ${i.state.name}] ===================`);
    console.log(i.description || '(No description)');
  });
}

inspectNewIssues().catch(console.error);
