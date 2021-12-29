const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new Schema({

    name: {
        type: String,

    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;