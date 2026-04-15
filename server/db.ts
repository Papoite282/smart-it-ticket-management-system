import fs from 'node:fs/promises';
import path from 'node:path';
import initSqlJs, { Database, QueryExecResult, SqlJsStatic, SqlValue } from 'sql.js';
import { differenceInHours, parseISO } from 'date-fns';
import { Ticket, TicketStatus, User } from './types';

const dataDir = path.join(process.cwd(), 'server', 'data');
const databasePath = path.join(dataDir, 'smart-it.db');

const seedUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Alicia Admin',
    email: 'admin@smartit.local',
    password: 'admin123',
    role: 'ADMIN',
    avatar: 'AA',
  },
  {
    id: 'agent-1',
    name: 'Marco Agent',
    email: 'agent@smartit.local',
    password: 'agent123',
    role: 'AGENT',
    avatar: 'MA',
  },
  {
    id: 'viewer-1',
    name: 'Vera Viewer',
    email: 'viewer@smartit.local',
    password: 'viewer123',
    role: 'VIEWER',
    avatar: 'VV',
  },
];

function buildResolutionTime(createdAt: string, status: TicketStatus, resolvedAt?: string) {
  if (status !== 'RESOLVED' || !resolvedAt) {
    return 0;
  }

  return Math.max(1, differenceInHours(parseISO(resolvedAt), parseISO(createdAt)));
}

function createSeedTickets(): Ticket[] {
  const ticketOneCreatedAt = new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString();
  const ticketTwoCreatedAt = new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString();
  const ticketThreeCreatedAt = new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString();
  const ticketThreeResolvedAt = new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString();

  return [
    {
      id: crypto.randomUUID(),
      title: 'VPN access failing for remote finance team',
      description: 'Several users report intermittent VPN disconnects during payroll processing.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignee: 'Admin',
      createdAt: ticketOneCreatedAt,
      updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      resolutionTimeHours: 11,
    },
    {
      id: crypto.randomUUID(),
      title: 'Laptop camera driver update',
      description: 'Prepare the latest camera driver package for onboarding devices.',
      priority: 'LOW',
      status: 'OPEN',
      assignee: 'Mia',
      createdAt: ticketTwoCreatedAt,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      resolutionTimeHours: 0,
    },
    {
      id: crypto.randomUUID(),
      title: 'Urgent email delivery delay in shared mailbox',
      description: 'Messages to support@ are delayed by over 10 minutes and need immediate attention.',
      priority: 'HIGH',
      status: 'RESOLVED',
      assignee: 'Admin',
      createdAt: ticketThreeCreatedAt,
      updatedAt: ticketThreeResolvedAt,
      resolvedAt: ticketThreeResolvedAt,
      resolutionTimeHours: buildResolutionTime(ticketThreeCreatedAt, 'RESOLVED', ticketThreeResolvedAt),
    },
  ];
}

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

async function getSqlJs() {
  if (SQL) {
    return SQL;
  }

  SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
  });
  return SQL;
}

async function saveDatabase() {
  if (!db) {
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(databasePath, Buffer.from(db.export()));
}

function exec(query: string, params: SqlValue[] = []) {
  if (!db) {
    throw new Error('Database not initialized');
  }

  db.run(query, params);
}

function query<T>(queryText: string, params: SqlValue[] = []): T[] {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const result = db.exec(queryText, params) as QueryExecResult[];
  if (result.length === 0) {
    return [];
  }

  const [first] = result;
  return first.values.map((row) => {
    const record: Record<string, unknown> = {};
    first.columns.forEach((column, index) => {
      record[column] = row[index];
    });
    return record as T;
  });
}

function createSchema() {
  exec('PRAGMA foreign_keys = ON');
  exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT NOT NULL
    )
  `);
  exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      assignee TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      resolvedAt TEXT,
      resolutionTimeHours INTEGER NOT NULL
    )
  `);
}

function count(table: string) {
  const rows = query<{ total: number }>(`SELECT COUNT(*) as total FROM ${table}`);
  return Number(rows[0]?.total ?? 0);
}

async function seedIfNeeded() {
  if (count('users') > 0) {
    return;
  }

  for (const user of seedUsers) {
    exec(
      'INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.name, user.email, user.password, user.role, user.avatar],
    );
  }

  for (const ticket of createSeedTickets()) {
    exec(
      'INSERT INTO tickets (id, title, description, priority, status, assignee, createdAt, updatedAt, resolvedAt, resolutionTimeHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        ticket.id,
        ticket.title,
        ticket.description,
        ticket.priority,
        ticket.status,
        ticket.assignee,
        ticket.createdAt,
        ticket.updatedAt,
        ticket.resolvedAt ?? null,
        ticket.resolutionTimeHours,
      ],
    );
  }

  await saveDatabase();
}

export async function initDatabase() {
  if (db) {
    return;
  }

  const sql = await getSqlJs();
  await fs.mkdir(dataDir, { recursive: true });

  try {
    const file = await fs.readFile(databasePath);
    db = new sql.Database(file);
  } catch {
    db = new sql.Database();
  }

  createSchema();
  await seedIfNeeded();
}

export async function resetDatabase() {
  await initDatabase();
  exec('DELETE FROM sessions');
  exec('DELETE FROM tickets');
  exec('DELETE FROM users');
  await saveDatabase();
  await seedIfNeeded();
}

export async function queryAll<T>(queryText: string, params: SqlValue[] = []) {
  await initDatabase();
  return query<T>(queryText, params);
}

export async function queryOne<T>(queryText: string, params: SqlValue[] = []) {
  const rows = await queryAll<T>(queryText, params);
  return rows[0] ?? null;
}

export async function execute(queryText: string, params: SqlValue[] = []) {
  await initDatabase();
  exec(queryText, params);
  await saveDatabase();
}