const { v4: uuidv4 } = require('uuid');
const { getDB }      = require('./db');

const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

function getNotifications({ page = 1, limit = 10, type = null, studentId = null }) {
  const db    = getDB();
  let all     = db.get();

  if (type)      all = all.filter(n => n.type === type);
  if (studentId) all = all.filter(n => n.student_id === studentId);

  const total = all.length;
  const start = (page - 1) * limit;
  const rows  = all.slice(start, start + limit);

  return { notifications: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

function getNotificationById(id) {
  return getDB().get().find(n => n.id === id) || null;
}

function createNotification({ type, message, studentId = null }) {
  const db  = getDB();
  const id  = uuidv4();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const newNotif = { id, type, message, is_read: 0, student_id: studentId, created_at: now };
  
  const all = db.get();
  all.unshift(newNotif);
  db.save(all);

  return newNotif;
}

function markAsRead(id) {
  const db = getDB();
  const all = db.get();
  const idx = all.findIndex(n => n.id === id);
  if (idx === -1) return null;
  all[idx].is_read = 1;
  db.save(all);
  return all[idx];
}

function deleteNotification(id) {
  const db = getDB();
  const all = db.get();
  const filtered = all.filter(n => n.id !== id);
  const changed = filtered.length !== all.length;
  db.save(filtered);
  return changed;
}

function computePriorityInbox(notifications) {
  const now = Date.now();
  const scored = notifications.map((n) => {
    const weight    = TYPE_WEIGHT[n.Type] ?? 1;
    const ageMs     = now - new Date(n.Timestamp.replace(' ', 'T')).getTime();
    const ageHours  = ageMs / 3_600_000;
    const recency   = Math.max(0, Math.round(999 - Math.log1p(ageHours) * 100));
    return { ...n, _score: weight * 1000 + recency };
  });
  return scored.sort((a, b) => b._score - a._score).slice(0, 10);
}

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  deleteNotification,
  computePriorityInbox,
};
