/**
 * Tests the node creation flow triggered by @mention "Create" in DescriptionEditor.
 * DescriptionEditor sends: POST /api/nodes { mindmap_id, text, position: { x: 0, y: 0 } }
 * Then must also POST /api/connections { mindmap_id, from_node_id, to_node_id, connection_type: 'mention' }
 */
const request = require('supertest');
const app = require('../index');
const Connection = require('../src/models/Connection');
const { connectDB, disconnectDB, clearDB, createUser, createMindmap, createNode } = require('./helpers');

beforeAll(connectDB);
afterAll(disconnectDB);
afterEach(clearDB);

describe('POST /api/nodes — @mention node creation', () => {
  it('creates a node with position {x:0, y:0} (the payload DescriptionEditor sends)', async () => {
    const { user, token } = await createUser();
    const map = await createMindmap(user.id);

    const res = await request(app)
      .post('/api/nodes')
      .set('x-auth-token', token)
      .send({
        mindmap_id: map._id.toString(),
        text: 'New Linked Node',
        position: { x: 0, y: 0 },
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ text: 'New Linked Node', mindmap_id: map._id.toString() });
  });

  it('rejects node creation without auth token', async () => {
    const { user } = await createUser();
    const map = await createMindmap(user.id);

    const res = await request(app)
      .post('/api/nodes')
      .send({ mindmap_id: map._id.toString(), text: 'Node', position: { x: 0, y: 0 } });

    expect(res.status).toBe(401);
  });

  it('rejects node creation for a mindmap owned by another user', async () => {
    const { user: owner } = await createUser({ username: 'owner', email: 'owner@example.com' });
    const { token: attackerToken } = await createUser({ username: 'attacker', email: 'attacker@example.com' });
    const map = await createMindmap(owner.id);

    const res = await request(app)
      .post('/api/nodes')
      .set('x-auth-token', attackerToken)
      .send({ mindmap_id: map._id.toString(), text: 'Evil Node', position: { x: 0, y: 0 } });

    expect(res.status).toBe(401);
  });

  it('rejects node creation with missing position', async () => {
    const { user, token } = await createUser();
    const map = await createMindmap(user.id);

    const res = await request(app)
      .post('/api/nodes')
      .set('x-auth-token', token)
      .send({ mindmap_id: map._id.toString(), text: 'Node' });

    expect(res.status).toBe(400);
  });
});

describe('@mention full flow — node + mention connection', () => {
  it('creates a mention connection from source node to new node', async () => {
    const { user, token } = await createUser();
    const map = await createMindmap(user.id);
    const sourceNode = await createNode(map._id);

    // Step 1: create the new node
    const nodeRes = await request(app)
      .post('/api/nodes')
      .set('x-auth-token', token)
      .send({ mindmap_id: map._id.toString(), text: 'Linked Node', position: { x: 0, y: 0 } });

    expect(nodeRes.status).toBe(200);
    const newNodeId = nodeRes.body._id;

    // Step 2: create the mention connection (this is what DescriptionEditor was missing)
    const connRes = await request(app)
      .post('/api/connections')
      .set('x-auth-token', token)
      .send({
        mindmap_id: map._id.toString(),
        from_node_id: sourceNode._id.toString(),
        to_node_id: newNodeId,
        connection_type: 'mention',
      });

    expect(connRes.status).toBe(200);
    expect(connRes.body).toMatchObject({ connection_type: 'mention' });

    // Verify connection exists in DB
    const conn = await Connection.findById(connRes.body._id);
    expect(conn).not.toBeNull();
    expect(conn.from_node_id.toString()).toBe(sourceNode._id.toString());
    expect(conn.to_node_id.toString()).toBe(newNodeId);
  });

  it('new node appears in connections/node/:id after mention creation', async () => {
    const { user, token } = await createUser();
    const map = await createMindmap(user.id);
    const sourceNode = await createNode(map._id);

    const nodeRes = await request(app)
      .post('/api/nodes')
      .set('x-auth-token', token)
      .send({ mindmap_id: map._id.toString(), text: 'Linked Node', position: { x: 0, y: 0 } });
    const newNodeId = nodeRes.body._id;

    await request(app)
      .post('/api/connections')
      .set('x-auth-token', token)
      .send({
        mindmap_id: map._id.toString(),
        from_node_id: sourceNode._id.toString(),
        to_node_id: newNodeId,
        connection_type: 'mention',
      });

    // The new node should now appear as outbound from sourceNode
    const linksRes = await request(app)
      .get(`/api/connections/node/${sourceNode._id}`)
      .set('x-auth-token', token);

    expect(linksRes.status).toBe(200);
    expect(linksRes.body.outbound).toHaveLength(1);
    expect(linksRes.body.outbound[0].to_node_id.toString()).toBe(newNodeId);
  });
});
