import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app';
import { store } from './store';

async function loginAs(email: string, password: string) {
  const app = createApp();
  const response = await request(app).post('/api/auth/login').send({ email, password });
  return response.body.data.token as string;
}

describe('backend API contract', () => {
  beforeEach(async () => {
    await store.reset();
  });

  it('rejects unauthenticated ticket requests', async () => {
    const app = createApp();
    const response = await request(app).get('/api/tickets');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Authentication required' });
  });

  it('logs in and returns a token plus user payload', async () => {
    const app = createApp();
    const response = await request(app).post('/api/auth/login').send({
      email: 'agent@smartit.local',
      password: 'agent123',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.role).toBe('AGENT');
    expect(response.body.data.token).toContain('mock-token-');
  });

  it('applies smart automation when creating an urgent ticket', async () => {
    const app = createApp();
    const token = await loginAs('agent@smartit.local', 'agent123');

    const response = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Urgent VPN outage',
        description: 'critical access failure for the sales team',
        priority: 'LOW',
        status: 'OPEN',
        assignee: 'Mia',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.priority).toBe('HIGH');
    expect(response.body.data.assignee).toBe('Admin');
  });

  it('prevents agents from deleting tickets and allows admins', async () => {
    const app = createApp();
    const agentToken = await loginAs('agent@smartit.local', 'agent123');
    const adminToken = await loginAs('admin@smartit.local', 'admin123');
    const ticketId = (await store.getTickets())[0].id;

    const forbidden = await request(app)
      .delete(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(forbidden.status).toBe(403);
    expect(forbidden.body).toEqual({ message: 'Insufficient permissions' });

    const allowed = await request(app)
      .delete(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(allowed.status).toBe(200);
    expect(allowed.body).toEqual({ success: true });
  });

  it('returns dashboard metrics in the expected response shape', async () => {
    const app = createApp();
    const token = await loginAs('viewer@smartit.local', 'viewer123');

    const response = await request(app)
      .get('/api/dashboard/metrics')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      totalTickets: expect.any(Number),
      openTickets: expect.any(Number),
      inProgressTickets: expect.any(Number),
      resolvedTickets: expect.any(Number),
      averageResolutionTime: expect.any(Number),
      statusDistribution: expect.any(Array),
      priorityDistribution: expect.any(Array),
    });
  });

  it('rejects invalid status transitions', async () => {
    const app = createApp();
    const token = await loginAs('agent@smartit.local', 'agent123');
    const ticketId = (await store.getTickets()).find((ticket) => ticket.status === 'OPEN')!.id;

    const response = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RESOLVED' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid status transition' });
  });
});