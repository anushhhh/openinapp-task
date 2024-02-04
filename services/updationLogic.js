async function updateSubTaskLogic(status) {
    if(status === 'TODO') {
        return 0;
    }
    else if(status === 'IN_PROGRESS') {
        return 0;
    }
    else if(status === 'DONE') {
        return 1;
    }
}

async function updateTaskStatus(taskId) {
    try {
        // Count total and completed subtasks
        const [totalSubtasks, completedSubtasks] = await Promise.all([
            Subtask.countDocuments({ task_id: taskId }),
            Subtask.countDocuments({ task_id: taskId, status: 1 })
        ]);

        // Find the task
        const task = await Task.findById(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        // logic to update task status based on total and completed subtasks
        if (completedSubtasks === totalSubtasks) {
            task.status = 'DONE';
        } else if (completedSubtasks > 0) {
            task.status = 'IN_PROGRESS';
        } else {
            task.status = 'TODO';
        }

        await task.save();
    } catch (error) {
        console.error(error);
        throw new Error('Error updating task status');
    }
}

module.exports = { updateSubTaskLogic, updateTaskStatus }