// Middleware to check admin authentication
export function withAuth(handler) {
  return async function(req, res) {
    // Skip auth for OPTIONS requests
    if (req.method === 'OPTIONS') {
      return handler(req, res);
    }

    // Get token from cookie or header
    const token = req.cookies?.admin_token || req.headers.authorization?.replace('Bearer ', '');

    // For now, just check if token exists
    // In production, verify JWT token properly
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Admin access required' 
      });
    }

    // Simple token validation (in production, verify JWT)
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [username] = decoded.split(':');
      
      if (!username) {
        throw new Error('Invalid token');
      }

      // Add user info to request
      req.user = { username };
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Please login again' 
      });
    }
  };
}
