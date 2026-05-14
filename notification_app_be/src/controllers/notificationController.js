const axios  = require('axios');
const { Log } = require('../../../logging_middleware/logger');
const svc    = require('../services/notificationService');

const VALID_TYPES    = ['Placement', 'Result', 'Event'];
const NOTIF_API_BASE = process.env.NOTIFICATION_API_BASE || 'http://4.224.186.213/evaluation-service';

async function listNotifications(req, res) {
  try {
    const page    = parseInt(req.query.page) || 1;
    const limit   = parseInt(req.query.limit) || 10;
    const type    = req.query.type || null;
    const studentId = req.query.studentId || null;

    const result = svc.getNotifications({ page, limit, type, studentId });
    await Log('backend', 'info', 'controller', `Fetched ${result.notifications.length} notifications`);
    return res.status(200).json({ data: result.notifications, meta: result });
  } catch (err) {
    await Log('backend', 'error', 'controller', err.message);
    return res.status(500).json({ error: err.message });
  }
}

async function getTopNotifications(req, res) {
  try {
    const r = await axios.get(`${NOTIF_API_BASE}/notifications`, { timeout: 5000 });
    const top10 = svc.computePriorityInbox(r.data.notifications || []);
    return res.status(200).json({ data: top10 });
  } catch (err) {
    console.error('[Upstream Error]', err.message);
    return res.status(200).json({ data: [], error: 'Upstream server unreachable' });
  }
}

async function addNotification(req, res) {
  try {
    const notif = svc.createNotification(req.body);
    await Log('backend', 'info', 'controller', `Created notification ${notif.id}`);
    return res.status(201).json({ data: notif });
  } catch (err) {
    await Log('backend', 'error', 'controller', err.message);
    return res.status(500).json({ error: err.message });
  }
}

async function markNotificationRead(req, res) {
  try {
    const updated = svc.markAsRead(req.params.id);
    await Log('backend', 'info', 'controller', `Marked ${req.params.id} as read`);
    return res.status(200).json({ data: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function removeNotification(req, res) {
  try {
    svc.deleteNotification(req.params.id);
    await Log('backend', 'info', 'controller', `Deleted ${req.params.id}`);
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listNotifications,
  getTopNotifications,
  addNotification,
  markNotificationRead,
  removeNotification,
};
