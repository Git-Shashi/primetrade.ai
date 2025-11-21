import { User } from '../models/User.js';
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
} from '../utils/errors.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

export class AuthService {
  static async register(userData) {
    const { name, email, password, role } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  static async login(email, password) {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    return user;
  }

  static async updateProfile(userId, updateData) {
    const { name, email } = updateData;
    
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    return user;
  }
}
