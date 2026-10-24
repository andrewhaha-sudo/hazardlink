const { app } = require('../server/src/server');

// Vercel serverless entry: strip the /api prefix so Express routes match.
module.exports = (req, res) => {
  if (req.url && req.url.startsWith('/api')) {
    req.url = req.url.slice(4) || '/';
  }
  return app(req, res);
};