# Backend Contract

## Base URL

The frontend reads the backend base URL from `VITE_API_BASE_URL`.
Example: `http://localhost:4000/api`

## Ticket Model

```ts
interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  assignee: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionTimeHours: number;
}
```

## Endpoints

### `GET /tickets`
Returns:

```json
{
  "data": []
}
```

### `POST /tickets`
Body:

```json
{
  "title": "Urgent VPN outage",
  "description": "Multiple employees cannot connect.",
  "priority": "MEDIUM",
  "status": "OPEN",
  "assignee": "Mia"
}
```

Returns:

```json
{
  "data": {}
}
```

### `PUT /tickets/:id`
Replaces the editable ticket fields and returns the updated ticket.

### `PATCH /tickets/:id/status`
Body:

```json
{
  "status": "IN_PROGRESS"
}
```

Returns the updated ticket.

### `DELETE /tickets/:id`
Returns:

```json
{
  "success": true
}
```

### `GET /dashboard/metrics`
Returns:

```json
{
  "data": {
    "totalTickets": 0,
    "openTickets": 0,
    "inProgressTickets": 0,
    "resolvedTickets": 0,
    "averageResolutionTime": 0,
    "statusDistribution": [],
    "priorityDistribution": []
  }
}
```

## Backend Responsibilities

- Persist tickets in a database.
- Apply smart automation server-side before saving.
- Compute dashboard metrics from stored ticket data.
- Validate status transitions.
- Return ISO date strings.
- Return consistent error payloads such as `{ "message": "Ticket not found" }`.