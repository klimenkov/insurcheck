const key = process.env.LINEAR_API_KEY || process.argv[2];
if (!key) {
  console.error('Please provide LINEAR_API_KEY environment variable or argument');
  process.exit(1);
}
fetch('https://api.linear.app/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': key },
  body: JSON.stringify({
    query: '{ issues(first: 50, filter: { team: { key: { eq: "INS" } } }) { nodes { identifier title priority state { name } } } }'
  })
}).then(r => r.json()).then(d => {
  const issues = d.data.issues.nodes;
  issues.sort((a,b) => a.identifier.localeCompare(b.identifier, undefined, {numeric: true})).forEach(i => {
    console.log(`${i.identifier} [${i.state.name}] (P${i.priority}): ${i.title}`);
  });
}).catch(console.error);
