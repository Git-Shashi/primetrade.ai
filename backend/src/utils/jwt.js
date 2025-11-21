import jwt from 'jsonwebtoken';

export const generateToken = (userId, secret, expiresIn) => {
  return jwt.sign({ userId }, secret, { expiresIn });
};

export const generateAccessToken = (userId) => {
  return generateToken(userId, process.env.JWT_SECRET, process.env.JWT_EXPIRE);
};

export const generateRefreshToken = (userId) => {
  return generateToken(
    userId,
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRE
  );
};

export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
