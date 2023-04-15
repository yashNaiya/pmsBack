const mongoose = require('mongoose')
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const project = new mongoose.Schema({
    workspaceId:{
        type:ObjectId,
    },
    clientId:{
        type:ObjectId,
    },
    name: {
        type: String,
    },
    due: {
        type: Date
    },
    manager: {
        type: mongoose.Schema.Types.Mixed,
        ref: "Users"
    },
    requirements: [{
        name: { type: String },
        desc: { type: String }
    }],
    doc: {
        type: String
    },
    members: [{
        type:ObjectId
    }],
    groups: [
        {
            name: { type: String },
            tasks: [{
                name: { type: String },
                ownerType:{type:String},
                chatId:{type: mongoose.Schema.Types.Mixed,},
                owner:{
                    type: mongoose.Schema.Types.Mixed,
                },
                status:{type:String},
                start:{type:Date},
                due:{type:Date},
                linkedTo:{
                    type: mongoose.Schema.Types.Mixed
                }
            }
        ],
        }
    ],
    action: [
        {
            name:{
                type: mongoose.Schema.Types.Mixed,
                ref: "Projects"
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


const Projects = mongoose.model("Projects", project);

module.exports = Projects;