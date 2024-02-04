const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Task = require('./models/task');
const Subtask = require('./models/subtask');
const authenticateToken = require('./middleware/auth')
const { updateSubTaskLogic, updateTaskStatus } = require('./services/updationLogic')
require('dotenv').config();
require('./db/conn');
const taskPriorityCron = require('./services/taskPriorityCron')
const voiceCallingCron = require('./services/voiceCallingCron')

const app = new express();
const port = 4000;

app.use(express.json())

const secret = 'anushkatopsecretkey1234'

app.get('/', (req, res) => {
    res.send("OpeninApp Task")
})

// create user API
app.post('/users', async (req, res) => {
    const { phone_number, priority } = req.body;
    try {
        const newUser = await User.create({
            phone_number,
            priority
        })
        res.status(200).json({
            user: newUser
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})

// get user by user id API
app.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({
                error: 'User not found'
            })
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})

// user login and authentication
app.post('/user/login', async (req, res) => {
    const { phone_number } = req.body;
    try {
        const user = await User.findOne({
            phone_number
        })
        console.log(user)

        if (user) {
            const token = jwt.sign(
                { userId: user._id },
                secret,
                { expiresIn: '24h' }
            );
            console.log(token)
            res.json({ token });
        }
        else {
            res.status(401).json({
                error: 'Invalid Credentials'
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })
    }
})

// create task API
app.post('/tasks', authenticateToken, async (req, res) => {
    const { title, description, due_date } = req.body;
    const userId = req.user.userId;
    try {
        const newTask = await Task.create({
            user_id: userId,
            title,
            description,
            due_date
        })
        console.log(newTask);
        res.status(200).json(newTask);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message
        })
    }
})

// create subTask API
app.post('/subtasks', authenticateToken, async (req, res) => {
    const { task_id } = req.body;
    try {
        const newSubTask = await Subtask.create({ task_id })
        console.log(newSubTask)
        res.status(200).json(newSubTask)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })
    }
})

// get all user tasks with filters and pagination
app.get('/tasks', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { priority, due_date, page = 1, limit = 10 } = req.query;

    const query = { user_id: userId, deleted_at: null }

    if (priority !== undefined) {
        query.priority = priority;
    }

    if (due_date !== undefined) {
        query.due_date = due_date;
    } else {
        query.due_date = { $exists: true };
    }
    console.log(query)
    try {
        const tasks = await Task.find(query)
            .sort(({ due_date: 'asc' }))
            .skip((page - 1) * limit)
            .limit(Number(limit));

        console.log(tasks);
        res.status(200).json(tasks);

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})

// get all user subtasks with filters and pagination
app.get('/subtasks', authenticateToken, async (req, res) => {
    const { task_id } = req.query;
    const userId = req.user.userId;
    console.log(userId);

    const query = { deleted_at: null }

    // if task_id is provided in query parameters
    if (task_id !== undefined) {
        query.task_id = task_id;
    } else {
        /* if task_id is not provided then fetch all task ids from from task collection
            and store task ids in query to later fetch all subtasks from subtask collection */

        const userTasks = await Task.find({ user_id: userId, deleted_at: null })
        const taskIds = userTasks.map(task => task._id);
        query.task_id = { $in: taskIds }
    }

    try {
        const subtasks = await Subtask.find(query);
        console.log(subtasks);
        res.status(200).json(subtasks);

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })
    }
})

// update task API
app.put('/tasks/:taskId', authenticateToken, async (req, res) => {
    const { taskId } = req.params;
    const { due_date, status } = req.body;

    try {
        const task = await Task.findOneAndUpdate(
            { _id: taskId, deleted_at: null },
            { due_date, status },
            { new: true }
        )
        console.log(task)
        if (task) {
            const subtaskStatus = await updateSubTaskLogic(status);
            console.log(subtaskStatus)

            await Subtask.updateMany({ task_id: taskId, deleted_at: null }, { status: subtaskStatus })
            res.status(200).json(task);
        } else {
            res.status(404).json({
                error: 'Task not found'
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })
    }
})

// update subtasks API
app.put('/subtasks/:subtaskId', authenticateToken, async (req, res) => {
    const { subtaskId } = req.params;
    const { status } = req.body;

    try {
        const subtask = await Subtask.findOneAndUpdate(
            { _id: subtaskId, deleted_at: null },
            { status },
            { new: true }
        );

        if (subtask) {
            await updateTaskStatus(subtask.task_id);
            res.status(200).json(subtask);
        } else {
            res.status(404).json({
                error: 'Subtask not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// soft deletion of task
app.delete('/tasks/:taskId', authenticateToken, async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findOneAndUpdate(
            { _id: taskId, deleted_at: null },
            { deleted_at: new Date() },
            { new: true }
        );
        console.log(task)

        if (task) {
            await Subtask.updateMany(
                { task_id: taskId, deleted_at: null },
                { $set: { deleted_at: new Date() } }
            );
            res.status(200).json({
                msg: 'Task Deleted Successfully'
            });
        } else {
            res.status(404).json({ 
                error: 'Task not found' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
})

// soft deletion of subtask
app.delete('/subtasks/:subtaskId', authenticateToken, async(req, res)=>{
    const { subtaskId } = req.params;
    
    try {
        const subtask = await Task.findOneAndUpdate(
            { _id: subtaskId, deleted_at: null },
            { deleted_at: new Date() },
            { new: true }
        );
        console.log(subtask)

        if(subtask) {
            res.status(200).json({
                msg: 'SubTask Deleted Successfully'
            });
        } else {
            res.status(404).json({ 
                error: 'SubTask not found' 
            });
        }
    } catch(error) {
        res.status(500).json({
            error: error.message
        })
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})