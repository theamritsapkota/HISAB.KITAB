// backend/middleware/authMiddleware.js
const authMiddleware = (req, res, next) => {
  console.log('Auth middleware triggered (fake)');
  next();
};

module.exports = authMiddleware;
