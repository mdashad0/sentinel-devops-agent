const AuthService = require('./AuthService');
const RBACService = require('./RBACService');
const ApiKeyService = require('./ApiKeyService');
const RateLimiterService = require('./RateLimiterService');

/**
 * Middleware to require authentication
 * Validates JWT token and attaches user context to request
 */
function requireAuth(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Validate token
    const payload = AuthService.validateAccessToken(token);
    
    // Attach user context to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      organizationId: payload.organizationId,
      roles: payload.roles,
      permissions: payload.permissions
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message || 'Invalid or expired token' });
  }
}

/**
 * Middleware to require specific permissions (AND logic)
 * All specified permissions must be present
 */
function requirePermissions(...permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user has all required permissions
      const userPermissions = req.user.permissions || [];
      const hasAll = permissions.every(perm => userPermissions.includes(perm));
      
      if (!hasAll) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permissions,
          current: userPermissions
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to require any permission (OR logic)
 * At least one of the specified permissions must be present
 */
function requireAnyPermission(...permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user has at least one required permission
      const userPermissions = req.user.permissions || [];
      const hasAny = permissions.some(perm => userPermissions.includes(perm));
      
      if (!hasAny) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permissions,
          current: userPermissions
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to require specific role
 */
function requireRole(roleName) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userRoles = req.user.roles || [];
      
      if (!userRoles.includes(roleName)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: roleName,
          current: userRoles
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Role check failed' });
    }
  };
}

/**
 * Middleware for API key authentication
 * Validates API key from X-API-Key header
 */
function requireApiKey(req, res, next) {
  try {
    // Extract API key from header
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }
    
    // Validate API key
    ApiKeyService.validateApiKey(apiKey)
      .then(keyData => {
        // Attach API key context to request
        req.apiKey = {
          userId: keyData.userId,
          organizationId: keyData.orgId,
          permissions: keyData.permissions,
          keyId: keyData.keyId
        };
        
        next();
      })
      .catch(error => {
        return res.status(401).json({ error: error.message || 'Invalid API key' });
      });
  } catch (error) {
    return res.status(401).json({ error: 'API key validation failed' });
  }
}

/**
 * Middleware for rate limiting
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 */
function rateLimit(maxRequests, windowMs) {
  return async (req, res, next) => {
    try {
      // Use IP address as key (or user ID if authenticated)
      const key = req.user?.userId || req.ip || req.connection.remoteAddress;
      
      const limitStatus = await RateLimiterService.checkLimit(key, maxRequests, windowMs);
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', limitStatus.remaining);
      res.setHeader('X-RateLimit-Reset', limitStatus.resetAt.toISOString());
      
      if (!limitStatus.allowed) {
        const retryAfter = Math.ceil((limitStatus.resetAt - new Date()) / 1000);
        res.setHeader('Retry-After', retryAfter);
        
        return res.status(429).json({ 
          error: 'Too many requests',
          retryAfter: limitStatus.resetAt
        });
      }
      
      next();
    } catch (error) {
      // Don't block request if rate limiting fails
      console.error('Rate limiting error:', error);
      next();
    }
  };
}

/**
 * Middleware to check organization access
 * Ensures user belongs to the organization they're trying to access
 */
function requireOrganization(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Get organization ID from params or body
    const targetOrgId = req.params.organizationId || req.body.organizationId;
    
    if (!targetOrgId) {
      return next(); // No organization check needed
    }
    
    // Check if user belongs to the organization
    if (req.user.organizationId !== targetOrgId) {
      return res.status(403).json({ error: 'Access denied to this organization' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Organization check failed' });
  }
}

module.exports = {
  requireAuth,
  requirePermissions,
  requireAnyPermission,
  requireRole,
  requireApiKey,
  rateLimit,
  requireOrganization
};
