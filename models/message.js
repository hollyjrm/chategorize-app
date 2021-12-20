const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    message: {
        type: String,
        required: true
    },
    time: {
        type: String
    },
    room: { type: Schema.Types.ObjectId, ref: 'Room' }
})

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;