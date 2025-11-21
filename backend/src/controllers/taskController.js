import { asyncHandler } from '../middleware/asyncHandler.js';
import { TaskService } from '../services/taskService.js';

export const createTask = asyncHandler(async (req, res) => {
  const task = await TaskService.createTask(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task },
  });
});

export const getAllTasks = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;
  const tasks = await TaskService.getAllTasks(
    req.user._id,
    req.user.role,
    { status, priority }
  );

  res.status(200).json({
    success: true,
    data: {
      count: tasks.length,
      tasks,
    },
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await TaskService.getTaskById(
    req.params.id,
    req.user._id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    data: { task },
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await TaskService.updateTask(
    req.params.id,
    req.body,
    req.user._id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task },
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  await TaskService.deleteTask(req.params.id, req.user._id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

export const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await TaskService.getTaskStats(req.user._id, req.user.role);

  res.status(200).json({
    success: true,
    data: { stats },
  });
});
