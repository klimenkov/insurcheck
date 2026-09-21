const key = process.env.LINEAR_API_KEY || process.argv[2];
const targetIdentifier = process.argv[3] || 'INS-28';
const targetStateName = process.argv[4] || 'In Progress';

async function updateState() {
  const q = `{
    workflowStates(filter: { team: { key: { eq: "INS" } } }) {
      nodes { id name }
    }
    issues(filter: { team: { key: { eq: "INS" } } }) {
      nodes { id identifier title }
    }
  }`;

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': key },
    body: JSON.stringify({ query: q })
  });
  const data = await res.json();
  const state = data.data.workflowStates.nodes.find(s => s.name.toLowerCase() === targetStateName.toLowerCase());
  const issue = data.data.issues.nodes.find(i => i.identifier === targetIdentifier);

  if (!state || !issue) {
    console.error('State or issue not found:', { targetIdentifier, targetStateName });
    return;
  }

  const m = `mutation UpdateIssue($id: String!, $stateId: String!) {
    issueUpdate(id: $id, input: { stateId: $stateId }) {
      success
      issue { identifier title state { name } }
    }
  }`;

  const mRes = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': key },
    body: JSON.stringify({
      query: m,
      variables: { id: issue.id, stateId: state.id }
    })
  });
  const mData = await mRes.json();
  console.log('Result:', mData.data.issueUpdate.issue);
}

updateState().catch(console.error);
