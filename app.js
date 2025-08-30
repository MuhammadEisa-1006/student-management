const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const logger = require('./middleware/logger');
const studentRoutes = require('./routes/students');

dotenv.config();

const app = express();
app.use(express.static('public'));

// DB connect
mongoose.connect(process.env.MONGODB_URI, { })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static
app.use('/public', express.static(path.join(__dirname, 'public')));

// Parsing
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use(logger);

// Routes
app.get('/', (req, res) => {
  res.render('index', { deadline: '30-08-2025', course: 'CS 311 – Web Programming' });
});

app.use('/students', studentRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('layout', {
    title: '404 Not Found',
    body: `<div class="container py-4"><h3>404</h3><p>Page not found.</p></div>`
  });
});

module.exports = app;
