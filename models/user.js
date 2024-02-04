const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    phone_number: { 
        type: Number,
        validate: {
            validator: value => {
              return /^[0-9]{10}$/.test(value.toString());
            },
            message: num => `${num.value} is not a valid phone number!`,
        },
    },
    priority: { 
        type: Number, 
        enum: [0, 1, 2], 
        default: 0 
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
  