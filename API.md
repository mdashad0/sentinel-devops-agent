# API Documentation

## Overview

Sentinel Backend API provides endpoints to monitor service health, manage incidents, and receive AI analysis reports.

**Base URL:** `http://localhost:4000` (development)

**Authentication:** Currently none (future: JWT tokens)

---

## 📊 Endpoints

### Health & Status

#### Get System Status
```http
GET /api/status
```

**Description:** Get current health status of all monitored services

**Response:**
```json
{
  "services": {
    "auth": {
      "status": "healthy",
      "code": 200,
      "lastUpdated": "2026-02-01T10:30:00Z"
    },
    "payment": {
      "status": "healthy",
      "code": 200,
      "lastUpdated": "2026-02-01T10:30:00Z"
    },
    "notification": {
      "status": "degraded",
      "code": 429,
      "lastUpdated": "2026-02-01T10:29:55Z"
    }
  },
  "aiAnalysis": "DEGRADED: Notification service experiencing rate limiting",
  "lastUpdated": "2026-02-01T10:30:00Z"
}
```

**Status Values:**
- `healthy` - Service responding normally (HTTP 200-299)
- `degraded` - Service experiencing issues (HTTP 400-499)
- `critical` - Service down (HTTP 500+)
- `unknown` - Never checked or unreachable

---

### Activity & Events

#### Get Activity Log
```http
GET /api/activity
```

**Description:** Get recent activity events and alerts

**Query Parameters:**
- `limit` (optional): Number of events to return (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "activity": [
    {
      "id": 1706781000000,
      "message": "AUTH service is DOWN (HTTP 500)",
      "type": "alert",
      "severity": "critical",
      "timestamp": "2026-02-01T10:30:00Z"
    },
    {
      "id": 1706780950000,
      "message": "PAYMENT service is DEGRADED (HTTP 429)",
      "type": "alert",
      "severity": "warning",
      "timestamp": "2026-02-01T10:29:10Z"
    }
  ]
}
```

**Fields:**
- `id` - Unique event ID (timestamp)
- `message` - Human-readable event message
- `type` - Event type (`alert`, `info`, `warning`)
- `severity` - Alert severity (`critical`, `warning`, `info`)
- `timestamp` - ISO 8601 timestamp

---

### AI Insights

#### Get AI Analysis
```http
GET /api/insights
```

**Description:** Get AI analysis from Kestra workflow executions

**Query Parameters:**
- `limit` (optional): Number of insights to return (default: 20, max: 100)

**Response:**
```json
{
  "insights": [
    {
      "id": "exec-001",
      "analysis": "DEGRADED: Payment service at 85% CPU. Recommend scaling workers.",
      "metrics": {
        "auth": { "code": 200 },
        "payment": { "code": 200 },
        "notification": { "code": 200 }
      },
      "summary": "System health at 98%. Minor CPU spike on payment service.",
      "timestamp": "2026-02-01T10:30:00Z"
    }
  ]
}
```

**Fields:**
- `id` - Execution ID from Kestra
- `analysis` - Raw AI analysis text
- `metrics` - Service metrics snapshot
- `summary` - Concise summary
- `timestamp` - When analysis was generated

---

### Webhooks

#### Kestra Webhook
```http
POST /api/kestra-webhook
Content-Type: application/json
```

**Description:** Receive status updates from Kestra workflow

**Request Body:**
```json
{
  "aiReport": "HEALTHY: All services operating normally",
  "metrics": {
    "auth": { "code": 200 },
    "payment": { "code": 200 },
    "notification": { "code": 200 }
  }
}
```

**Response:**
```json
{
  "success": true
}
```

**Used By:** Kestra workflow at `kestra-flows/intelligent-monitor.yaml`

---

## 🔄 Data Models

### Service Status
```typescript
interface ServiceStatus {
  status: "healthy" | "degraded" | "critical" | "unknown";
  code: number;  // HTTP status code
  lastUpdated: Date;
}
```

### Activity Event
```typescript
interface ActivityEvent {
  id: number;
  message: string;
  type: "alert" | "info" | "warning";
  severity: "critical" | "warning" | "info";
  timestamp: Date;
}
```

### AI Insight
```typescript
interface AIInsight {
  id: string;
  analysis: string;  // Raw AI response
  metrics: Record<string, { code: number }>;
  summary: string;
  timestamp: Date;
}
```

---

## 📋 Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Service healthy | API responds normally |
| 429 | Rate limited | Too many requests |
| 500 | Server error | Database connection failed |
| 503 | Service unavailable | Maintenance or crash |

---

## 🔄 Response Examples

### All Services Healthy
```json
{
  "services": {
    "auth": { "status": "healthy", "code": 200 },
    "payment": { "status": "healthy", "code": 200 },
    "notification": { "status": "healthy", "code": 200 }
  },
  "aiAnalysis": "HEALTHY: All systems operational",
  "lastUpdated": "2026-02-01T10:35:00Z"
}
```

### Partial Outage
```json
{
  "services": {
    "auth": { "status": "healthy", "code": 200 },
    "payment": { "status": "critical", "code": 500 },
    "notification": { "status": "healthy", "code": 200 }
  },
  "aiAnalysis": "DEGRADED: Payment service down. Initiating auto-healing...",
  "lastUpdated": "2026-02-01T10:36:00Z"
}
```

---

## 🧪 Testing with curl

### Check system status
```bash
curl http://localhost:4000/api/status
```

### Get activity log
```bash
curl http://localhost:4000/api/activity
```

### Get AI insights
```bash
curl http://localhost:4000/api/insights
```

### Test webhook (simulate Kestra)
```bash
curl -X POST http://localhost:4000/api/kestra-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "aiReport": "TEST: Webhook integration working",
    "metrics": {"auth": {"code": 200}}
  }'
```

---

## 🔐 Security Notes

**Current Implementation:**
- CORS enabled (all origins)
- No authentication required
- No rate limiting

**Production Recommendations:**
- Implement JWT authentication
- Add rate limiting (100 req/min per IP)
- Restrict CORS to known origins
- Use HTTPS only
- Add request signing

---

## 📈 Rate Limiting (Future)

```
Tier: Free
- 100 requests/minute
- 10,000 requests/day
- 30-day data retention

Tier: Pro
- 1,000 requests/minute
- 100,000 requests/day
- 1-year data retention
```

---

## 🚀 Usage Examples

### Get latest incident
```javascript
const response = await fetch('http://localhost:4000/api/status');
const data = await response.json();
const worstService = Object.entries(data.services)
  .sort((a, b) => b[1].code - a[1].code)[0];
console.log(`Worst service: ${worstService[0]}`);
```

### Monitor for changes
```javascript
let lastStatus = null;

setInterval(async () => {
  const response = await fetch('http://localhost:4000/api/status');
  const data = await response.json();
  
  if (JSON.stringify(data) !== JSON.stringify(lastStatus)) {
    console.log('Status changed:', data);
    lastStatus = data;
  }
}, 5000); // Poll every 5 seconds
```

### Trigger alert on critical
```javascript
const response = await fetch('http://localhost:4000/api/status');
const data = await response.json();

const critical = Object.values(data.services)
  .some(s => s.status === 'critical');

if (critical) {
  // Send alert
  console.alert('CRITICAL: Service down!');
}
```

---

## 📚 Related Documentation

- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Backend setup
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [Backend Code](../backend/index.js)

---

**Last Updated:** February 1, 2026
**API Version:** 1.0.0
