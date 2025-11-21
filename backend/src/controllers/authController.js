import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthService } from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.getProfile(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.updateProfile(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});
