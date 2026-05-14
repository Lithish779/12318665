import React from 'react';

export default function NotificationCard({ notification, rank }) {
  const type    = notification.type || notification.Type;
  const message = notification.message || notification.Message;
  const time    = notification.created_at || notification.Timestamp;

  return (
    <div className="notif-card">
      {rank && <div className="badge">{rank}</div>}
      <div className={`type-dot ${type}`}></div>
      <div className="content">
        <div className="message">{message}</div>
        <div className="meta">
          <span className="type">{type}</span>
          <span className="time">{time}</span>
        </div>
      </div>
    </div>
  );
}
