# Campus Notification Platform — System Design

## Stage 1: API Design Contract

### Core Actions
- **Display Notifications**: Real-time delivery and paginated history.
- **Manage Subscriptions**: Opt-in/out of specific categories (Placement, Events, Results).
- **Interaction**: Mark as read/unread, delete, or archive.

### REST API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/notifications` | Add a new notification (Admin/Service use) |
| GET    | `/notifications` | List paginated notifications for current student |
| GET    | `/notifications/top` | Get Priority Inbox (Top 10 ranked) |
| PATCH  | `/notifications/:id/read` | Mark a notification as read |
| DELETE | `/notifications/:id` | Remove a notification |

---

## Stage 2: Database & Scaling

### Database Choice
**PostgreSQL** (for production) or **SQLite** (for local evaluation).

### Schema (SQL)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  student_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Stage 3: Query Optimization

1. **Why is this slow?** Full Table Scan (O(N)).
2. **Changes**: Add Composite Index on `(student_id, is_read, created_at DESC)`.
3. **Computational Cost**: O(log N).
4. **Indexes on every column?** No. Slower writes and storage overhead.
5. **Querying Type**: `WHERE type = 'Placement'`.

---

## Stage 4: Performance Strategy

### Solution: Caching Layer
Use **Redis** to cache user notification counts and first-page results.

---

## Stage 5: Reliability & Scale

### Redesign (Revised Pseudocode)
```javascript
async function notify_all(student_ids, message) {
  for (const id of student_ids) {
    await save_to_db(id, message);
    await job_queue.add('send-notification', { id, message });
  }
}
```
**Benefits**: Async processing, retries, and high throughput.
---

## Stage 6: Priority Inbox Implementation

### Ranking Algorithm
The Priority Inbox uses a weighted scoring system to rank notifications from the test server.

**Formula**: `Score = (Type Weight × 1000) + Recency Score`

- **Weights**: Placement (3) > Result (2) > Event (1).
- **Recency Score**: `Math.max(0, Math.round(999 - Math.log1p(ageHours) * 100))`.
  - Uses logarithmic decay to ensure newer notifications stay higher even within the same category.
  
### Implementation Strategy
1. **Fetch**: Pull 25+ notifications from the upstream API.
2. **Score**: Apply the formula above to each notification object.
3. **Sort**: Order by `score DESC`.
4. **Slice**: Return the top 10 items for the UI.
