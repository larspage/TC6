async function req(path, options = {}) {
  const res = await fetch(`/api${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0]?.msg || data.msg || 'API error');
  return data;
}

export function login(email, password) {
  return req('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function getMindmaps(token) {
  return req('/mindmaps', { headers: { 'x-auth-token': token } });
}

export function getNodes(token, mindmapId) {
  return req(`/nodes/${mindmapId}`, { headers: { 'x-auth-token': token } });
}

export function getConnections(token, mindmapId) {
  return req(`/connections/${mindmapId}`, { headers: { 'x-auth-token': token } });
}

export function updateNode(token, nodeId, fields) {
  return req(`/nodes/${nodeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
    body: JSON.stringify(fields),
  });
}
