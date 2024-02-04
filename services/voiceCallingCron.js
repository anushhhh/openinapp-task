const cron = require('node-cron');
const Task = require('../models/task');
const User = require('../models/user');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new twilio(accountSid, authToken);

cron.schedule('10 * * * *', async () => {
    try {
        // Fetch tasks with overdue due dates
        const overdueTasks = await Task.find({
            due_date: { $lt: new Date() },
            status: { $ne: 'DONE' },
            deleted_at: null,
        }).populate('user_id')

        console.log(overdueTasks)

        // sorting tasks based on priority
        overdueTasks.sort((taskA, taskB) => taskA.user_id.priority - taskB.user_id.priority);

        // logic for initiating the calls
        for (const task of overdueTasks) {

            const userPhoneNumber = task.user_id.phone_number;
            console.log(userPhoneNumber)

            // Call the user using Twilio
            const call = await twilioClient.calls.create({
                to: userPhoneNumber,
                from: '+18283921982',
                url: 'https://demo.twilio.com/welcome/voice/',
            })
  
            console.log(`Voice call initiated for user ${userPhoneNumber}.`)

            if (call.status === 'completed') {
                console.log(`User ${userPhoneNumber} attended the call. Exiting the calling loop.`);
                break
            }
        }
    } catch(error) {
        console.error('Error initiating voice calls:', error)
    }
})