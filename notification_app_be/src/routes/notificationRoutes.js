const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/notificationController');

router.get('/',        ctrl.listNotifications);
router.get('/top',     ctrl.getTopNotifications);
router.post('/',       ctrl.addNotification);
router.patch('/:id/read', ctrl.markNotificationRead);
router.delete('/:id',  ctrl.removeNotification);

module.exports = router;
