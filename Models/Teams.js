const mongoose = require("mongoose")
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const team = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    admin:
    {
        type: mongoose.Schema.Types.Mixed,
        ref: "Users"
    },
    workspace:{
        type: Object,
    },
    state: {
        type: Boolean,
        default: false
    },
    projects:[
        {
            type: mongoose.Schema.Types.Mixed,
        }
    ],
    members: [
        {
            type: mongoose.Schema.Types.Mixed,
        }
    ],
    action: [
        {
            name:{
                type: mongoose.Schema.Types.Mixed,
                ref: "Teams"
            },
            action: {
                type: String
            },
            by: {
                type: mongoose.Schema.Types.Mixed,
                ref: "Users"
            },
            users: {
                type: mongoose.Schema.Types.Mixed,
                ref: "Users"
            },
            metadata:{
               type: mongoose.Schema.Types.Mixed,
            }
        }
    ]
})


const Teams = mongoose.model("Teams", team);

module.exports = Teams;