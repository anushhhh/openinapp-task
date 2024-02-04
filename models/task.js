const mongoose = require('mongoose')
const moment = require('moment')

const taskSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    due_date: { 
        type: Date,
        nullabe: true,
        set: function (input) {
            return moment(input, "DD-MM-YYYY").toISOString();
        }
    },
    priority: { 
        type: Number, 
        enum: [0, 1, 2, 3], 
        default: 0,
    }, // Priority levels (0, 1-2, 3-4, 5+)
    status: {
        type: String,
        enum: ['TODO', 'IN_PROGRESS', 'DONE'],
        default: 'TODO',
        required: true
    }, // Task status (TODO, IN_PROGRESS, DONE)
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    },
    deleted_at: { 
        type: Date 
    }
  });
  
  const Task = mongoose.model('Task', taskSchema);
  module.exports = Task;