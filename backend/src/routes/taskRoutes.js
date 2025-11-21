import express from 'express';
import {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, taskSchema, updateTaskSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllTasks)
  .post(validate(taskSchema), createTask);

router.get('/stats', getTaskStats);

router.route('/:id')
  .get(getTask)
  .put(validate(updateTaskSchema), updateTask)
  .delete(deleteTask);

export default router;
