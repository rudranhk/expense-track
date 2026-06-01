const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const expenseRoutes = require('./routes/expenses');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);

const clientBuildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuildPath));
app.use((req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expensetracker';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB error:', err));

app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`));
