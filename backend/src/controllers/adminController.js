import { asyncHandler } from '../middleware/asyncHandler.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    query.role = role;
  }

  const users = await User.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Get user's task stats
  const taskStats = await Task.aggregate([
    { $match: { owner: user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    pending: 0,
    'in-progress': 0,
    completed: 0,
    cancelled: 0
  };

  taskStats.forEach(stat => {
    stats[stat._id] = stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      user,
      taskStats: stats
    }
  });
});

// Update user role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    throw new ValidationError('Invalid role. Must be "user" or "admin"');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Prevent self-demotion
  if (user._id.toString() === req.user._id.toString() && role === 'user') {
    throw new ValidationError('Cannot demote yourself');
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Prevent self-deletion
  if (user._id.toString() === req.user._id.toString()) {
    throw new ValidationError('Cannot delete yourself');
  }

  // Delete user's tasks
  await Task.deleteMany({ owner: user._id });

  await User.deleteOne({ _id: user._id });

  res.status(200).json({
    success: true,
    message: 'User and associated tasks deleted successfully'
  });
});

// Get all tasks (admin view)
export const getAllTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, userId } = req.query;

  const query = {};
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (userId) query.owner = userId;

  const tasks = await Task.find(query)
    .populate('owner', 'name email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Task.countDocuments(query);

  res.status(200).json({
    success: true,
    data: tasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

// Get tasks by user
export const getTasksByUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const tasks = await Task.find({ owner: req.params.userId })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      tasks
    }
  });
});

// Get platform statistics
export const getPlatformStats = asyncHandler(async (req, res) => {
  const [userStats, taskStats, recentUsers] = await Promise.all([
    // User statistics
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Task statistics
    Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Recent users (last 7 days)
    User.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).countDocuments()
  ]);

  const totalUsers = await User.countDocuments();
  const totalTasks = await Task.countDocuments();

  const users = {
    total: totalUsers,
    admins: userStats.find(s => s._id === 'admin')?.count || 0,
    regularUsers: userStats.find(s => s._id === 'user')?.count || 0,
    recentSignups: recentUsers
  };

  const tasks = {
    total: totalTasks,
    pending: taskStats.find(s => s._id === 'pending')?.count || 0,
    inProgress: taskStats.find(s => s._id === 'in-progress')?.count || 0,
    completed: taskStats.find(s => s._id === 'completed')?.count || 0,
    cancelled: taskStats.find(s => s._id === 'cancelled')?.count || 0
  };

  res.status(200).json({
    success: true,
    data: {
      users,
      tasks,
      overview: {
        totalUsers,
        totalTasks,
        completionRate: totalTasks > 0 
          ? ((tasks.completed / totalTasks) * 100).toFixed(2) 
          : 0
      }
    }
  });
});
