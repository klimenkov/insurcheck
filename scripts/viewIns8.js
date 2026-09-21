const key = process.env.LINEAR_API_KEY || process.argv[2];

async function viewIns8() {
  const query = `{
    issues(first: 50, filter: { team: { key: { eq: "INS" } } }) {
      nodes {
        id
        identifier
        title
        priority
        priorityLabel
        state { name }
        description
        url
        updatedAt
        comments {
          nodes {
            id
            createdAt
            body
            user { name }
          }
        }
      }
    }
  }`;

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': key },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const issue = data.data?.issues?.nodes.find(n => n.identifier === 'INS-8');
  console.log(JSON.stringify(issue, null, 2));
}

viewIns8().catch(console.error);
