import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllTasks,
  getTasksByUser,
  getPlatformStats
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Task management
router.get('/tasks', getAllTasks);
router.get('/tasks/user/:userId', getTasksByUser);

// Platform statistics
router.get('/stats', getPlatformStats);

export default router;
