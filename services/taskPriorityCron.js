const cron = require('node-cron')
const Task = require('../models/task')

cron.schedule('10 * * * *', async ()=> {
    try {
        const tasks = await Task.find({
            due_date: { $exists: true, $ne: null },
            deleted_at: null
        })
        console.log(tasks)

        tasks.forEach(async task => {
            const today = new Date();
            console.log(today)
            const dueDate = new Date(task.due_date);
            console.log(dueDate)

            let priority = 0;

            if(dueDate.toDateString() === today.toDateString()) {
                priority = 0;
            }
            else {
                const timediff = dueDate.getTime() - today.getTime();
                console.log(timediff)
                const daydiff = Math.ceil(timediff / (1000 * 3600 * 24));
                console.log(daydiff)

                if(daydiff <= 2) {
                    priority = 1;
                }
                else if(daydiff <= 4) {
                    priority = 2;
                }
                else {
                    priority = 3;
                }
            }
            const updationQuery = await Task.updateOne({ _id: task._id }, { $set: { priority } });
            console.log(updationQuery);
        })
        console.log('Task priorities updated successfully.');
    } catch(error) {
        console.error('Error updating task priorities:', error.message);
    }
})
