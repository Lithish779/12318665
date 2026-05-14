import React, { useEffect, useState } from 'react';
import './styles/index.css';
import { fetchNotifications, fetchTopNotifications } from './utils/api';
import NotificationCard from './components/NotificationCard';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [topNotifs, setTopNotifs] = useState([]);
  const [filter, setFilter] = useState('');
  const [view, setView] = useState('all');

  useEffect(() => {
    if (view === 'all') {
      fetchNotifications({ type: filter }).then(res => setNotifications(res.data));
    } else {
      fetchTopNotifications().then(res => setTopNotifs(res.data));
    }
  }, [filter, view]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>CampusNotify</h1>
        <div className="view-switch">
          <button className={`tab ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>All</button>
          <button className={`tab ${view === 'top' ? 'active' : ''}`} onClick={() => setView('top')}>Priority Inbox</button>
        </div>
      </header>

      {view === 'all' && (
        <div className="filter-tabs">
          {['', 'Placement', 'Result', 'Event'].map(t => (
            <button 
              key={t} 
              className={`tab ${filter === t ? 'active' : ''}`} 
              onClick={() => setFilter(t)}
            >
              {t || 'All Categories'}
            </button>
          ))}
        </div>
      )}

      <div className="notif-list">
        {view === 'all' ? (
          notifications.map(n => <NotificationCard key={n.id} notification={n} />)
        ) : (
          topNotifs.map((n, i) => <NotificationCard key={n.ID} notification={n} rank={i + 1} />)
        )}
      </div>
    </div>
  );
}

export default App;
