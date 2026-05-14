require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { initDB }         = require('./services/db');
const notificationRoutes = require('./routes/notificationRoutes');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/notifications', notificationRoutes);

async function start() {
  try {
    initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

start();
