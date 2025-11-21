import { Task } from '../models/Task.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

export class TaskService {
  static async createTask(taskData, userId) {
    const task = await Task.create({
      ...taskData,
      owner: userId,
    });

    return await task.populate('owner', 'name email');
  }

  static async getAllTasks(userId, role, filters = {}) {
    const query = role === 'admin' ? {} : { owner: userId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    const tasks = await Task.find(query)
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return tasks;
  }

  static async getTaskById(taskId, userId, role) {
    const task = await Task.findById(taskId)
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (role !== 'admin' && task.owner._id.toString() !== userId) {
      throw new AuthorizationError('You do not have access to this task');
    }

    return task;
  }

  static async updateTask(taskId, updateData, userId, role) {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (role !== 'admin' && task.owner.toString() !== userId) {
      throw new AuthorizationError('You can only update your own tasks');
    }

    Object.assign(task, updateData);
    await task.save();

    return await task.populate('owner', 'name email');
  }

  static async deleteTask(taskId, userId, role) {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (role !== 'admin' && task.owner.toString() !== userId) {
      throw new AuthorizationError('You can only delete your own tasks');
    }

    await task.deleteOne();
    return { message: 'Task deleted successfully' };
  }

  static async getTaskStats(userId, role) {
    const matchStage = role === 'admin' ? {} : { owner: userId };

    const stats = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      byStatus: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: priorityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }
}
