import express from 'express'
import { listTasks, getTask, createTask, updateTask, deleteTask, toggleTask } from '../controllers/taskController'

const router = express.Router()

router.get('/', listTasks)
router.get('/:id', getTask)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)
router.patch('/:id/toggle', toggleTask)

export default router

