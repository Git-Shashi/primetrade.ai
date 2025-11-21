import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AuthenticationError('Not authorized to access this route');
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Role '${req.user.role}' is not authorized to access this route`
      );
    }
    next();
  };
};
