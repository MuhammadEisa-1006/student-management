// api/index.js (Vercel entry)
const serverless = require('serverless-http');
const app = require('../app'); // our Express app (no listen here)
module.exports = serverless(app);
