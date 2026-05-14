import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({ baseURL: API_BASE });

export const fetchNotifications = (params) => api.get('/notifications', { params }).then(r => r.data);
export const fetchTopNotifications = () => api.get('/notifications/top').then(r => r.data);
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const deleteNotif = (id) => api.delete(`/notifications/${id}`);
