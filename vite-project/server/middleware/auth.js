const jwt = require('jsonwebtoken')

// Signs and verifies tokens. In a real production app this secret would
// live in an environment variable (process.env.JWT_SECRET), never
// hardcoded — but for local dev this keeps things simple.
const JWT_SECRET = 'taskflow_dev_secret_change_me'

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization // "Bearer eyJhbGciOi..."

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = { id: decoded.id, username: decoded.username }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' })
  }
}

module.exports = { requireAuth, JWT_SECRET }