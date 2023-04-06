const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
    members: [
        {
            type: mongoose.Schema.Types.Mixed,
        }
    ],
    conversations: [
        {
            sender:
            {
                type: mongoose.Schema.Types.Mixed,
            },
            text:
            {
                type: String,
            },
        },
        { timestamps: true }
    ]

},
    { timestamps: true }

);

const Chats = mongoose.model("Conversation", ChatSchema);

module.exports = Chats;
